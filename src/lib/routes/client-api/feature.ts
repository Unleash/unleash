import memoizee from 'memoizee';
import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import FeatureToggleService from '../../services/feature-toggle-service';
import { Logger } from '../../logger';
import { querySchema } from '../../schema/feature-schema';
import { IFeatureToggleQuery, ISegment } from '../../types/model';
import NotFoundError from '../../error/notfound-error';
import { IAuthRequest } from '../unleash-types';
import ApiUser from '../../types/api-user';
import { ALL, isAllProjects } from '../../types/models/api-token';
import { SegmentService } from '../../services/segment-service';
import { FeatureConfigurationClient } from '../../types/stores/feature-strategies-store';
import { ClientSpecService } from '../../services/client-spec-service';

const version = 2;

interface QueryOverride {
    project?: string[];
    environment?: string;
}

export default class FeatureController extends Controller {
    private readonly logger: Logger;

    private featureToggleServiceV2: FeatureToggleService;

    private segmentService: SegmentService;

    private clientSpecService: ClientSpecService;

    private readonly cache: boolean;

    private cachedFeatures: any;

    constructor(
        {
            featureToggleServiceV2,
            segmentService,
            clientSpecService,
        }: Pick<
            IUnleashServices,
            'featureToggleServiceV2' | 'segmentService' | 'clientSpecService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        const { experimental } = config;
        this.featureToggleServiceV2 = featureToggleServiceV2;
        this.segmentService = segmentService;
        this.clientSpecService = clientSpecService;
        this.logger = config.getLogger('client-api/feature.js');

        this.get('/', this.getAll);
        this.get('/:featureName', this.getFeatureToggle);

        if (experimental && experimental.clientFeatureMemoize) {
            this.cache = experimental.clientFeatureMemoize.enabled;
            this.cachedFeatures = memoizee(
                (query) => this.resolveFeaturesAndSegments(query),
                {
                    promise: true,
                    // @ts-expect-error
                    maxAge: experimental.clientFeatureMemoize.maxAge,
                    normalizer(args) {
                        // args is arguments object as accessible in memoized function
                        return JSON.stringify(args[0]);
                    },
                },
            );
        }
    }

    private async resolveFeaturesAndSegments(
        query?: IFeatureToggleQuery,
    ): Promise<[FeatureConfigurationClient[], ISegment[]]> {
        return Promise.all([
            this.featureToggleServiceV2.getClientFeatures(query),
            this.segmentService.getActive(),
        ]);
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
            return null;
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

    async getAll(req: IAuthRequest, res: Response): Promise<void> {
        const query = await this.resolveQuery(req);

        const [features, segments] = this.cache
            ? await this.cachedFeatures(query)
            : await Promise.all([
                  this.featureToggleServiceV2.getClientFeatures(query),
                  this.segmentService.getActive(),
              ]);

        if (this.clientSpecService.requestSupportsSpec(req, 'segments')) {
            res.json({ version, features, query, segments });
        } else {
            res.json({ version, features, query });
        }
    }

    async getFeatureToggle(req: IAuthRequest, res: Response): Promise<void> {
        const name = req.params.featureName;
        const featureQuery = await this.resolveQuery(req);
        const q = { ...featureQuery, namePrefix: name };
        const toggles = await this.featureToggleServiceV2.getClientFeatures(q);

        const toggle = toggles.find((t) => t.name === name);
        if (!toggle) {
            throw new NotFoundError(`Could not find feature toggle ${name}`);
        }
        res.json(toggle).end();
    }
}
