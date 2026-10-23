import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type {
    FeatureSearchService,
    OpenApiService,
    IUnleashServices,
} from '../../services/index.js';
import {
    type IFeatureSearchOverview,
    type IFlagResolver,
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import {
    createResponseSchema,
    getStandardResponses,
    type SearchFeaturesSchema,
    searchFeaturesSchema,
} from '../../openapi/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import {
    type FeatureSearchQueryParameters,
    featureSearchQueryParameters,
} from '../../openapi/spec/feature-search-query-parameters.js';
import {
    type ContextFieldValuesQueryParameters,
    contextFieldValuesQueryParameters,
} from '../../openapi/spec/context-field-values-query-parameters.js';
import {
    type ContextFieldValuesSchema,
    contextFieldValuesSchema,
} from '../../openapi/spec/context-field-values-schema.js';
import { normalizeQueryParams } from './search-utils.js';
import { anonymise, extractUserId } from '../../util/index.js';

type FeatureSearchServices = Pick<
    IUnleashServices,
    'openApiService' | 'featureSearchService'
>;

export default class FeatureSearchController extends Controller {
    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private featureSearchService: FeatureSearchService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        { openApiService, featureSearchService }: FeatureSearchServices,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.featureSearchService = featureSearchService;
        this.logger = config.getLogger(
            '/feature-search/feature-search-controller.ts',
        );

        this.route({
            method: 'get',
            path: '',
            handler: this.searchFeatures,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Search'],
                    summary: 'Search and filter features',
                    description: 'Search and filter by selected fields.',
                    release: { stable: '5.6.0' },
                    operationId: 'searchFeatures',
                    // top level array needs to be mutable according to openapi library
                    parameters: [...featureSearchQueryParameters],
                    responses: {
                        200: createResponseSchema('searchFeaturesSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/context-field-values',
            handler: this.getContextFieldValues,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Search'],
                    summary:
                        'Get context field values used by feature flag constraints',
                    description:
                        'Returns the distinct context field values used by strategy and segment constraints in a project. Useful for building filter options for the feature search.',
                    release: { beta: '8.2.0' },
                    operationId: 'getContextFieldValues',
                    parameters: [...contextFieldValuesQueryParameters],
                    responses: {
                        200: createResponseSchema('contextFieldValuesSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    maybeAnonymise(
        features: IFeatureSearchOverview[],
    ): IFeatureSearchOverview[] {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return features.map((feature) => ({
                ...feature,
                createdBy: {
                    ...feature.createdBy,
                    name: anonymise(feature.createdBy.name),
                },
            }));
        }
        return features;
    }

    async searchFeatures(
        req: IAuthRequest<any, any, any, FeatureSearchQueryParameters>,
        res: Response<SearchFeaturesSchema>,
    ): Promise<void> {
        const {
            query,
            project,
            type,
            tag,
            segment,
            createdAt,
            createdBy,
            state,
            status,
            lifecycle,
            favoritesFirst,
            archived,
            favorite,
            sortBy,
            lastSeenAt,
            contextField,
        } = req.query;
        const userId = extractUserId(req);
        const {
            normalizedQuery,
            normalizedSortOrder,
            normalizedOffset,
            normalizedLimit,
        } = normalizeQueryParams(
            {
                query,
                offset: req.query.offset,
                limit: req.query.limit,
                sortOrder: req.query.sortOrder,
            },
            {
                limitDefault: 50,
                maxLimit: 100,
            },
        );

        const normalizedStatus = status
            ?.map((tag) => tag.split(':'))
            .filter(
                (tag) =>
                    tag.length === 2 &&
                    ['enabled', 'disabled'].includes(tag[1]),
            );
        const normalizedFavoritesFirst = favoritesFirst === 'true';
        const normalizedArchived = archived === 'IS:true';
        const { features, total } = await this.featureSearchService.search({
            searchParams: normalizedQuery,
            project,
            type,
            userId,
            tag,
            segment,
            state,
            createdAt,
            createdBy,
            sortBy,
            lifecycle,
            lastSeenAt,
            favorite,
            contextField,
            status: normalizedStatus,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortOrder: normalizedSortOrder,
            favoritesFirst: normalizedFavoritesFirst,
            archived: normalizedArchived,
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            searchFeaturesSchema.$id,
            serializeDates({
                features: this.maybeAnonymise(features),
                total,
            }),
        );
    }

    async getContextFieldValues(
        req: IAuthRequest<any, any, any, ContextFieldValuesQueryParameters>,
        res: Response<ContextFieldValuesSchema>,
    ): Promise<void> {
        const { project } = req.query;
        const contextFieldValues =
            await this.featureSearchService.getContextFieldValues(
                extractUserId(req),
                project,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            contextFieldValuesSchema.$id,
            contextFieldValues,
        );
    }
}
