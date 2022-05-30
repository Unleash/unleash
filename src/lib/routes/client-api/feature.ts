import memoizee from 'memoizee';
import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import FeatureToggleService from '../../services/feature-toggle-service';
import { Logger } from '../../logger';
import { querySchema } from '../../schema/feature-schema';
import { IFeatureToggleQuery } from '../../types/model';
import NotFoundError from '../../error/notfound-error';
import { IAuthRequest } from '../unleash-types';
import ApiUser from '../../types/api-user';
import { ALL, isAllProjects } from '../../types/models/api-token';
import { SegmentService } from 'lib/services/segment-service';

const version = 2;

interface QueryOverride {
    project?: string[];
    environment?: string;
}

export default class FeatureController extends Controller {
    private readonly logger: Logger;

    private featureToggleServiceV2: FeatureToggleService;

    private segmentService: SegmentService;

    private readonly cache: boolean;

    private cachedFeatures: any;

    private useGlobalSegments: boolean;

    constructor(
        {
            featureToggleServiceV2,
            segmentService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'segmentService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        const { experimental } = config;
        this.featureToggleServiceV2 = featureToggleServiceV2;
        this.segmentService = segmentService;
        this.logger = config.getLogger('client-api/feature.js');
        this.get('/', this.getAll);
        this.get('/:featureName', this.getFeatureToggle);
        this.useGlobalSegments =
            experimental && !experimental?.segments?.inlineSegmentConstraints;

        if (experimental && experimental.clientFeatureMemoize) {
            // @ts-ignore
            this.cache = experimental.clientFeatureMemoize.enabled;
            this.cachedFeatures = memoizee(
                (query) => this.featureToggleServiceV2.getClientFeatures(query),
                {
                    promise: true,
                    // @ts-ignore
                    maxAge: experimental.clientFeatureMemoize.maxAge,
                    normalizer(args) {
                        // args is arguments object as accessible in memoized function
                        return JSON.stringify(args[0]);
                    },
                },
            );
        }
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

        const q = { ...query, ...override };
        return this.prepQuery(q);
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
    }: IFeatureToggleQuery): Promise<IFeatureToggleQuery> {
        if (!tag && !project && !namePrefix && !environment) {
            return null;
        }
        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
            environment,
        });
        if (query.tag) {
            query.tag = query.tag.map((q) => q.split(':'));
        }
        return query;
    }

    async getAll(req: IAuthRequest, res: Response): Promise<void> {
        const featureQuery = await this.resolveQuery(req);
        let features;
        if (this.cache) {
            features = await this.cachedFeatures(featureQuery);
        } else {
            features = await this.featureToggleServiceV2.getClientFeatures(
                featureQuery,
            );
        }

        const response = {
            version,
            features,
            query: featureQuery,
        };

        if (this.useGlobalSegments) {
            const segments = await this.segmentService.getActive();
            res.json({
                ...response,
                segments,
            });
        } else {
            res.json(response);
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
