import memoizee from 'memoizee';
import { Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import hashSum from 'hash-sum';
// eslint-disable-next-line import/no-extraneous-dependencies
import { diff } from 'deep-object-diff';
import Controller from '../controller';
import { IFlagResolver, IUnleashConfig, IUnleashServices } from '../../types';
import FeatureToggleService from '../../services/feature-toggle-service';
import { Logger } from '../../logger';
import { querySchema } from '../../schema/feature-schema';
import { IFeatureToggleQuery, ISegment } from '../../types/model';
import NotFoundError from '../../error/notfound-error';
import { IAuthRequest } from '../unleash-types';
import ApiUser from '../../types/api-user';
import { ALL, isAllProjects } from '../../types/models/api-token';
import { FeatureConfigurationClient } from '../../types/stores/feature-strategies-store';
import { ClientSpecService } from '../../services/client-spec-service';
import { OpenApiService } from '../../services/openapi-service';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { ClientFeaturesQuerySchema } from '../../openapi/spec/client-features-query-schema';
import {
    clientFeatureSchema,
    ClientFeatureSchema,
} from '../../openapi/spec/client-feature-schema';
import {
    clientFeaturesSchema,
    ClientFeaturesSchema,
} from '../../openapi/spec/client-features-schema';
import { ISegmentService } from 'lib/segments/segment-service-interface';
import { EventService } from 'lib/services';
import { hoursToMilliseconds } from 'date-fns';
import { isEmpty } from '../../util/isEmpty';
import EventEmitter from 'events';

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

    private eventBus: EventEmitter;

    private featureToggleServiceV2: FeatureToggleService;

    private segmentService: ISegmentService;

    private clientSpecService: ClientSpecService;

    private openApiService: OpenApiService;

    private eventService: EventService;

    private readonly cache: boolean;

    private cachedFeatures: any;

    private cachedFeatures2: any;

    private flagResolver: IFlagResolver;

    constructor(
        {
            featureToggleServiceV2,
            segmentService,
            clientSpecService,
            openApiService,
            eventService,
        }: Pick<
            IUnleashServices,
            | 'featureToggleServiceV2'
            | 'segmentService'
            | 'clientSpecService'
            | 'openApiService'
            | 'eventService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        const { clientFeatureCaching, flagResolver, eventBus } = config;
        this.featureToggleServiceV2 = featureToggleServiceV2;
        this.segmentService = segmentService;
        this.clientSpecService = clientSpecService;
        this.openApiService = openApiService;
        this.flagResolver = flagResolver;
        this.eventService = eventService;
        this.logger = config.getLogger('client-api/feature.js');
        this.eventBus = eventBus;

        this.route({
            method: 'get',
            path: '/:featureName',
            handler: this.getFeatureToggle,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getClientFeature',
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
                    operationId: 'getAllClientFeatures',
                    tags: ['Client'],
                    responses: {
                        200: createResponseSchema('clientFeaturesSchema'),
                    },
                }),
            ],
        });

        if (clientFeatureCaching?.enabled) {
            this.cache = true;
            this.cachedFeatures = memoizee(
                (query) => this.resolveFeaturesAndSegments(query),
                {
                    promise: true,
                    maxAge: clientFeatureCaching.maxAge,
                    normalizer(args) {
                        // args is arguments object as accessible in memoized function
                        return JSON.stringify(args[0]);
                    },
                },
            );
        }
        this.cachedFeatures2 = memoizee(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (query: IFeatureToggleQuery, etag: string) =>
                this.resolveFeaturesAndSegments(query),
            {
                promise: true,
                maxAge: hoursToMilliseconds(1),
                normalizer(args) {
                    // args is arguments object as accessible in memoized function
                    return args[1];
                },
            },
        );
    }

    private async resolveFeaturesAndSegments(
        query?: IFeatureToggleQuery,
    ): Promise<[FeatureConfigurationClient[], ISegment[]]> {
        this.logger.debug('bypass cache');
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
        if (this.flagResolver.isEnabled('optimal304')) {
            return this.optimal304(req, res);
        }

        const query = await this.resolveQuery(req);

        const [features, segments] = this.cache
            ? await this.cachedFeatures(query)
            : await this.resolveFeaturesAndSegments(query);

        if (this.flagResolver.isEnabled('optimal304Differ')) {
            process.nextTick(async () =>
                this.doOptimal304Diffing(features, query),
            );
        }

        if (this.clientSpecService.requestSupportsSpec(req, 'segments')) {
            this.openApiService.respondWithValidation(
                200,
                res,
                clientFeaturesSchema.$id,
                { version, features, query: { ...query }, segments },
            );
        } else {
            this.openApiService.respondWithValidation(
                200,
                res,
                clientFeaturesSchema.$id,
                { version, features, query },
            );
        }
    }

    /**
     * This helper method is used to validate that the new way of calculating
     * cache-key based on query hash and revision id, with an internal memoization
     * of 1hr still ends up producing the same result.
     *
     * It's worth to note that it is expected that a diff will occur immediately after
     * a toggle changes due to the nature of two individual caches and how fast they
     * detect the change. The diffs should however go away as soon as they both have
     * the latest feature toggle configuration, which will happen within 600ms on the
     * default configurations.
     *
     * This method is experimental and will only be used to validate our internal state
     * to make sure our new way of caching is correct and stable.
     *
     * @deprecated
     */
    async doOptimal304Diffing(
        features: FeatureConfigurationClient[],
        query: IFeatureToggleQuery,
    ): Promise<void> {
        try {
            const { etag } = await this.calculateMeta(query);
            const [featuresNew] = await this.cachedFeatures2(query, etag);
            const theDiffedObject = diff(features, featuresNew);

            if (isEmpty(theDiffedObject)) {
                this.logger.warn('The diff is: <Empty>');
                this.eventBus.emit('optimal304Differ', { status: 'equal' });
            } else {
                this.logger.warn(
                    `The diff is: ${JSON.stringify(theDiffedObject)}`,
                );
                this.eventBus.emit('optimal304Differ', { status: 'diff' });
            }
        } catch (e) {
            this.logger.error('The diff checker crashed', e);
            this.eventBus.emit('optimal304Differ', { status: 'crash' });
        }
    }

    async calculateMeta(query: IFeatureToggleQuery): Promise<IMeta> {
        // TODO: We will need to standardize this to be able to implement this a cross languages (Edge in Rust?).
        const revisionId = await this.eventService.getMaxRevisionId();

        // TODO: We will need to standardize this to be able to implement this a cross languages (Edge in Rust?).
        const queryHash = hashSum(query);
        const etag = `"${queryHash}:${revisionId}"`;
        return { revisionId, etag, queryHash };
    }

    async optimal304(
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
            res.end();
            return;
        } else {
            this.logger.debug(
                `Provided revision: ${userVersion}, calculated revision: ${etag}`,
            );
        }

        const [features, segments] = await this.cachedFeatures2(query, etag);

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

    async getFeatureToggle(
        req: IAuthRequest<{ featureName: string }, ClientFeaturesQuerySchema>,
        res: Response<ClientFeatureSchema>,
    ): Promise<void> {
        const name = req.params.featureName;
        const featureQuery = await this.resolveQuery(req);
        const q = { ...featureQuery, namePrefix: name };
        const toggles = await this.featureToggleServiceV2.getClientFeatures(q);
        const toggle = toggles.find((t) => t.name === name);
        if (!toggle) {
            throw new NotFoundError(`Could not find feature toggle ${name}`);
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
