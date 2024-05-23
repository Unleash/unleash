import memoizee from 'memoizee';
import type { Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import hashSum from 'hash-sum';
import Controller from '../../routes/controller';
import type {
    IClientSegment,
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../types';
import type FeatureToggleService from '../feature-toggle/feature-toggle-service';
import type { Logger } from '../../logger';
import { querySchema } from '../../schema/feature-schema';
import type { IFeatureToggleQuery } from '../../types/model';
import NotFoundError from '../../error/notfound-error';
import type { IAuthRequest } from '../../routes/unleash-types';
import ApiUser from '../../types/api-user';
import { ALL, isAllProjects } from '../../types/models/api-token';
import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type { ClientSpecService } from '../../services/client-spec-service';
import type { OpenApiService } from '../../services/openapi-service';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import type { ClientFeaturesQuerySchema } from '../../openapi/spec/client-features-query-schema';
import {
    clientFeatureSchema,
    type ClientFeatureSchema,
} from '../../openapi/spec/client-feature-schema';
import {
    clientFeaturesSchema,
    type ClientFeaturesSchema,
} from '../../openapi/spec/client-features-schema';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import type { ClientFeatureToggleService } from './client-feature-toggle-service';

const version = 2;

interface QueryOverride {
    project?: string[];
    environment?: string;
}

interface IMeta {
    revisionId: number;
    etag: string;
    queryHash: string;
}

export default class FeatureController extends Controller {
    private readonly logger: Logger;

    private clientFeatureToggleService: ClientFeatureToggleService;

    private clientSpecService: ClientSpecService;

    private openApiService: OpenApiService;

    private configurationRevisionService: ConfigurationRevisionService;

    private featureToggleService: FeatureToggleService;

    private flagResolver: IFlagResolver;

    private featuresAndSegments: (
        query: IFeatureToggleQuery,
        etag: string,
    ) => Promise<[FeatureConfigurationClient[], IClientSegment[]]>;

    constructor(
        {
            clientFeatureToggleService,
            clientSpecService,
            openApiService,
            configurationRevisionService,
            featureToggleService,
        }: Pick<
            IUnleashServices,
            | 'clientFeatureToggleService'
            | 'clientSpecService'
            | 'openApiService'
            | 'configurationRevisionService'
            | 'featureToggleService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        const { clientFeatureCaching } = config;
        this.clientFeatureToggleService = clientFeatureToggleService;
        this.clientSpecService = clientSpecService;
        this.openApiService = openApiService;
        this.configurationRevisionService = configurationRevisionService;
        this.featureToggleService = featureToggleService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('client-api/feature.js');

        this.route({
            method: 'get',
            path: '/:featureName',
            handler: this.getFeatureToggle,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getClientFeature',
                    summary: 'Get a single feature flag',
                    description:
                        'Gets all the client data for a single flag. Contains the exact same information about a flag as the `/api/client/features` endpoint does, but only contains data about the specified flag. All SDKs should use `/api/client/features`',
                    tags: ['Client'],
                    responses: {
                        200: createResponseSchema('clientFeatureSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '',
            handler: this.getAll,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all flags (SDK)',
                    description:
                        'Returns the SDK configuration for all feature flags that are available to the provided API key. Used by SDKs to configure local evaluation',
                    operationId: 'getAllClientFeatures',
                    tags: ['Client'],
                    responses: {
                        200: createResponseSchema('clientFeaturesSchema'),
                    },
                }),
            ],
        });

        if (clientFeatureCaching.enabled) {
            this.featuresAndSegments = memoizee(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (query: IFeatureToggleQuery, etag: string) =>
                    this.resolveFeaturesAndSegments(query),
                {
                    promise: true,
                    maxAge: clientFeatureCaching.maxAge,
                    normalizer(args) {
                        // args is arguments object as accessible in memoized function
                        return args[1];
                    },
                },
            );
        } else {
            this.featuresAndSegments = this.resolveFeaturesAndSegments;
        }
    }

    private async resolveFeaturesAndSegments(
        query?: IFeatureToggleQuery,
    ): Promise<[FeatureConfigurationClient[], IClientSegment[]]> {
        return Promise.all([
            this.clientFeatureToggleService.getClientFeatures(query),
            this.clientFeatureToggleService.getActiveSegmentsForClient(),
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

    async getAll(
        req: IAuthRequest,
        res: Response<ClientFeaturesSchema>,
    ): Promise<void> {
        const query = await this.resolveQuery(req);

        const userVersion = req.headers['if-none-match'];
        const meta = await this.calculateMeta(query);
        const { etag } = meta;

        res.setHeader('ETag', etag);

        if (etag === userVersion) {
            res.status(304);
            res.getHeaderNames().forEach((header) => res.removeHeader(header));
            res.end();
            return;
        } else {
            this.logger.debug(
                `Provided revision: ${userVersion}, calculated revision: ${etag}`,
            );
        }

        const [features, segments] = await this.featuresAndSegments(
            query,
            etag,
        );

        if (this.clientSpecService.requestSupportsSpec(req, 'segments')) {
            this.openApiService.respondWithValidation(
                200,
                res,
                clientFeaturesSchema.$id,
                {
                    version,
                    features,
                    query: { ...query },
                    segments,
                    meta,
                },
            );
        } else {
            this.openApiService.respondWithValidation(
                200,
                res,
                clientFeaturesSchema.$id,
                { version, features, query, meta },
            );
        }
    }

    async calculateMeta(query: IFeatureToggleQuery): Promise<IMeta> {
        // TODO: We will need to standardize this to be able to implement this a cross languages (Edge in Rust?).
        const revisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        // TODO: We will need to standardize this to be able to implement this a cross languages (Edge in Rust?).
        const queryHash = hashSum(query);
        const etag = `"${queryHash}:${revisionId}"`;
        return { revisionId, etag, queryHash };
    }

    async getFeatureToggle(
        req: IAuthRequest<{ featureName: string }, ClientFeaturesQuerySchema>,
        res: Response<ClientFeatureSchema>,
    ): Promise<void> {
        const name = req.params.featureName;
        const featureQuery = await this.resolveQuery(req);
        const q = { ...featureQuery, namePrefix: name };

        const toggles =
            await this.clientFeatureToggleService.getClientFeatures(q);

        const toggle = toggles.find((t) => t.name === name);
        if (!toggle) {
            throw new NotFoundError(`Could not find feature flag ${name}`);
        }
        this.openApiService.respondWithValidation(
            200,
            res,
            clientFeatureSchema.$id,
            {
                ...toggle,
            },
        );
    }
}
