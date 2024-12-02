import type { Response } from 'express';
import Controller from '../../routes/controller';
import type {
    IFeatureToggleQuery,
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../types';
import type { Logger } from '../../logger';
import type { IAuthRequest } from '../../routes/unleash-types';
import { NONE } from '../../types/permissions';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../feature-toggle/configuration-revision-service';
import type { ClientFeatureToggleService } from './client-feature-toggle-service';
import ApiUser from '../../types/api-user';
import { ALL, isAllProjects } from '../../types/models/api-token';
import { querySchema } from '../../schema/feature-schema';
import hashSum from 'hash-sum';

type ResponseWithFlush = Response & { flush: Function };

type SSEClientResponse = {
    req: IAuthRequest;
    res: ResponseWithFlush;
};

interface QueryOverride {
    project?: string[];
    environment?: string;
}

interface IMeta {
    revisionId: number;
    etag: string;
    queryHash: string;
}

export class FeatureStreamingController extends Controller {
    private readonly logger: Logger;

    private configurationRevisionService: ConfigurationRevisionService;

    private clientFeatureToggleService: ClientFeatureToggleService;

    private flagResolver: IFlagResolver;

    private activeConnections: Set<SSEClientResponse>;

    constructor(
        {
            configurationRevisionService,
            clientFeatureToggleService,
        }: Pick<
            IUnleashServices,
            'configurationRevisionService' | 'clientFeatureToggleService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleService = clientFeatureToggleService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('client-api/streaming.js');

        this.activeConnections = new Set();
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );

        this.route({
            method: 'get',
            path: '',
            handler: this.getFeatureStream,
            permission: NONE,
            middleware: [],
        });
    }

    async getFeatureStream(
        req: IAuthRequest,
        res: ResponseWithFlush,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('streaming')) {
            res.status(403).end();
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });

        res.write(`data: CONNECTED\n\n`);
        res.flush();

        const connection = { req, res };
        this.activeConnections.add(connection);

        res.on('close', () => {
            this.activeConnections.delete(connection);
        });
    }

    private async onUpdateRevisionEvent() {
        for (const connection of this.activeConnections) {
            const { req, res } = connection;

            if (res.writableEnded) {
                this.activeConnections.delete(connection);
                continue;
            }

            try {
                const update = await this.getClientFeaturesResponse(req);
                res.write(`data: UPDATE:${JSON.stringify(update)}\n\n`);
                res.flush();
            } catch (err) {
                this.logger.info('Failed to send event. Dropping connection.');
                this.activeConnections.delete(connection);
            }
        }
    }

    private async getClientFeaturesResponse(req: IAuthRequest) {
        const query = await this.resolveQuery(req);
        const meta = await this.calculateMeta(query);

        const features =
            await this.clientFeatureToggleService.getClientFeatures(query);
        const segments =
            await this.clientFeatureToggleService.getActiveSegmentsForClient();

        return {
            version: 2,
            features,
            query,
            segments,
            meta,
        };
    }

    private async resolveQuery(
        req: IAuthRequest,
    ): Promise<IFeatureToggleQuery> {
        const { user, query } = req;

        const override: QueryOverride = {};
        if (user instanceof ApiUser) {
            if (!isAllProjects(user.projects)) {
                override.project = user.projects;
            }
            if (user.environment !== ALL) {
                override.environment = user.environment;
            }
        }

        return this.prepQuery({
            ...query,
            ...override,
            inlineSegmentConstraints: false,
        });
    }

    private paramToArray(param: any) {
        if (!param) {
            return param;
        }
        return Array.isArray(param) ? param : [param];
    }

    private async prepQuery({
        tag,
        project,
        namePrefix,
        environment,
        inlineSegmentConstraints,
    }: IFeatureToggleQuery): Promise<IFeatureToggleQuery> {
        if (
            !tag &&
            !project &&
            !namePrefix &&
            !environment &&
            !inlineSegmentConstraints
        ) {
            return {};
        }

        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
            environment,
            inlineSegmentConstraints,
        });

        if (query.tag) {
            query.tag = query.tag.map((q) => q.split(':'));
        }

        return query;
    }

    private async calculateMeta(query: IFeatureToggleQuery): Promise<IMeta> {
        const revisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        const queryHash = hashSum(query);
        const etag = `"${queryHash}:${revisionId}"`;
        return { revisionId, etag, queryHash };
    }
}
