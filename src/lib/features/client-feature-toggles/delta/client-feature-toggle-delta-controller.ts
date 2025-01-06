import type { Response } from 'express';
import Controller from '../../../routes/controller';
import type {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../../types';
import type { Logger } from '../../../logger';
import { querySchema } from '../../../schema/feature-schema';
import type { IFeatureToggleQuery } from '../../../types/model';
import NotFoundError from '../../../error/notfound-error';
import type { IAuthRequest } from '../../../routes/unleash-types';
import ApiUser from '../../../types/api-user';
import { ALL, isAllProjects } from '../../../types/models/api-token';
import type { ClientSpecService } from '../../../services/client-spec-service';
import type { OpenApiService } from '../../../services/openapi-service';
import { NONE } from '../../../types/permissions';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import type { ClientFeatureToggleService } from '../client-feature-toggle-service';
import {
    type ClientFeaturesDeltaSchema,
    clientFeaturesDeltaSchema,
} from '../../../openapi';
import type { QueryOverride } from '../client-feature-toggle.controller';

export default class ClientFeatureToggleDeltaController extends Controller {
    private readonly logger: Logger;

    private clientFeatureToggleService: ClientFeatureToggleService;

    private clientSpecService: ClientSpecService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        {
            clientFeatureToggleService,
            clientSpecService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'clientFeatureToggleService'
            | 'clientSpecService'
            | 'openApiService'
            | 'featureToggleService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        this.clientFeatureToggleService = clientFeatureToggleService;
        this.clientSpecService = clientSpecService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('client-api/delta.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getDelta,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get partial updates (SDK)',
                    description:
                        'Initially returns the full set of feature flags available to the provided API key. When called again with the returned etag, only returns the flags that have changed',
                    operationId: 'getDelta',
                    tags: ['Unstable'],
                    responses: {
                        200: createResponseSchema('clientFeaturesDeltaSchema'),
                    },
                }),
            ],
        });
    }

    async getDelta(
        req: IAuthRequest,
        res: Response<ClientFeaturesDeltaSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('deltaApi')) {
            throw new NotFoundError();
        }
        const query = await this.resolveQuery(req);
        const etag = req.headers['if-none-match'];

        const currentSdkRevisionId = etag ? Number.parseInt(etag) : undefined;

        const changedFeatures =
            await this.clientFeatureToggleService.getClientDelta(
                currentSdkRevisionId,
                query,
            );

        if (!changedFeatures) {
            res.status(304);
            res.getHeaderNames().forEach((header) => res.removeHeader(header));
            res.end();
            return;
        }

        if (changedFeatures.revisionId === currentSdkRevisionId) {
            res.status(304);
            res.getHeaderNames().forEach((header) => res.removeHeader(header));
            res.end();
            return;
        }

        res.setHeader('ETag', changedFeatures.revisionId.toString());
        this.openApiService.respondWithValidation(
            200,
            res,
            clientFeaturesDeltaSchema.$id,
            changedFeatures,
        );
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

        const inlineSegmentConstraints =
            !this.clientSpecService.requestSupportsSpec(req, 'segments');

        return this.prepQuery({
            ...query,
            ...override,
            inlineSegmentConstraints,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
}
