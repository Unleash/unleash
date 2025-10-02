import memoizee from 'memoizee';
import type { Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import hashSum from 'hash-sum';
import Controller from '../../routes/controller.js';
import type {
    IClientSegment,
    IFlagResolver,
    IUnleashConfig,
} from '../../types/index.js';
import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';
import type { Logger } from '../../logger.js';
import { querySchema } from '../../schema/feature-schema.js';
import type { IFeatureToggleQuery } from '../../types/model.js';
import NotFoundError from '../../error/notfound-error.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import ApiUser from '../../types/api-user.js';
import { ALL, isAllProjects } from '../../types/models/api-token.js';
import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { ClientSpecService } from '../../services/client-spec-service.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { NONE } from '../../types/permissions.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type { ClientFeaturesQuerySchema } from '../../openapi/spec/client-features-query-schema.js';
import type EventEmitter from 'events';
import {
    clientFeatureSchema,
    type ClientFeatureSchema,
} from '../../openapi/spec/client-feature-schema.js';
import {
    clientFeaturesSchema,
    type ClientFeaturesSchema,
} from '../../openapi/spec/client-features-schema.js';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service.js';
import type { ClientFeatureToggleService } from './client-feature-toggle-service.js';
import {
    CLIENT_FEATURES_MEMORY,
    CLIENT_METRICS_NAMEPREFIX,
    CLIENT_METRICS_TAGS,
} from '../../internals.js';
import isEqual from 'lodash.isequal';
import { diff } from 'json-diff';
import type { IUnleashServices } from '../../services/index.js';

const version = 2;

export interface QueryOverride {
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

    private eventBus: EventEmitter;

    private clientFeaturesCacheMap = new Map<string, number>();

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
        this.eventBus = config.eventBus;
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
                (query: IFeatureToggleQuery, _etag: string) =>
                    this.resolveFeaturesAndSegments(query),
                {
                    promise: true,
                    maxAge: clientFeatureCaching.maxAge,
                    normalizer([_query, etag]) {
                        return etag;
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
        if (this.flagResolver.isEnabled('deltaApi')) {
            const features =
                await this.clientFeatureToggleService.getClientFeatures(query);

            const segments =
                await this.clientFeatureToggleService.getActiveSegmentsForClient();

            try {
                const featuresSize = this.getCacheSizeInBytes(features);
                const segmentsSize = this.getCacheSizeInBytes(segments);
                this.clientFeaturesCacheMap.set(
                    JSON.stringify(query),
                    featuresSize + segmentsSize,
                );

                const delta =
                    await this.clientFeatureToggleService.getClientDelta(
                        undefined,
                        query!,
                    );

                const sortedToggles = features.sort((a, b) =>
                    a.name.localeCompare(b.name),
                );
                if (delta?.events[0].type === 'hydration') {
                    const hydrationEvent = delta?.events[0];
                    const sortedNewToggles = hydrationEvent.features.sort(
                        (a, b) => a.name.localeCompare(b.name),
                    );

                    if (
                        !this.deepEqualIgnoreOrder(
                            sortedToggles,
                            sortedNewToggles,
                        )
                    ) {
                        this.logger.warn(
                            `old features and new features are different. Old count ${
                                features.length
                            }, new count ${hydrationEvent.features.length}, query ${JSON.stringify(query)},
                        diff ${JSON.stringify(
                            diff(sortedToggles, sortedNewToggles),
                        )}`,
                        );
                    }
                } else {
                    this.logger.warn(
                        `Delta diff should have only hydration event, query ${JSON.stringify(query)}`,
                    );
                }

                this.storeFootprint();
            } catch (e) {
                this.logger.error('Delta diff failed', e);
            }

            return [features, segments];
        }
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

        if (namePrefix) {
            this.eventBus.emit(CLIENT_METRICS_NAMEPREFIX);
        }

        if (tag) {
            this.eventBus.emit(CLIENT_METRICS_TAGS);
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
        const revisionId =
            await this.configurationRevisionService.getMaxRevisionId(
                query.environment,
            );

        const queryHash = hashSum(query);
        const etag = `"${queryHash}:${revisionId}:v1"`;
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

    storeFootprint() {
        let memory = 0;
        for (const value of this.clientFeaturesCacheMap.values()) {
            memory += value;
        }
        this.eventBus.emit(CLIENT_FEATURES_MEMORY, { memory });
    }

    getCacheSizeInBytes(value: any): number {
        const jsonString = JSON.stringify(value);
        return Buffer.byteLength(jsonString, 'utf8');
    }

    deepEqualIgnoreOrder = (obj1, obj2) => {
        const sortedObj1 = JSON.parse(
            JSON.stringify(obj1, Object.keys(obj1).sort()),
        );
        const sortedObj2 = JSON.parse(
            JSON.stringify(obj2, Object.keys(obj2).sort()),
        );
        return isEqual(sortedObj1, sortedObj2);
    };
}
