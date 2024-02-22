import { Response } from 'express';
import Controller from '../../routes/controller';
import { FeatureSearchService, OpenApiService } from '../../services';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    serializeDates,
} from '../../types';
import { Logger } from '../../logger';
import {
    createResponseSchema,
    getStandardResponses,
    searchFeaturesSchema,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import {
    FeatureSearchQueryParameters,
    featureSearchQueryParameters,
} from '../../openapi/spec/feature-search-query-parameters';
import { normalizeQueryParams } from './search-utils';

const PATH = '/features';

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
            path: PATH,
            handler: this.searchFeatures,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Search'],
                    summary: 'Search and filter features',
                    description: 'Search and filter by selected fields.',
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
    }

    async searchFeatures(
        req: IAuthRequest<any, any, any, FeatureSearchQueryParameters>,
        res: Response,
    ): Promise<void> {
        const {
            query,
            project,
            type,
            tag,
            segment,
            createdAt,
            state,
            status,
            favoritesFirst,
        } = req.query;
        const userId = req.user.id;
        const {
            normalizedQuery,
            normalizedSortBy,
            normalizedSortOrder,
            normalizedOffset,
            normalizedLimit,
        } = normalizeQueryParams(req.query, {
            limitDefault: 50,
            maxLimit: 100,
            sortByDefault: 'createdAt',
        });

        const normalizedStatus = status
            ?.map((tag) => tag.split(':'))
            .filter(
                (tag) =>
                    tag.length === 2 &&
                    ['enabled', 'disabled'].includes(tag[1]),
            );
        const normalizedFavoritesFirst = favoritesFirst === 'true';
        const { features, total } = await this.featureSearchService.search({
            searchParams: normalizedQuery,
            project,
            type,
            userId,
            tag,
            segment,
            state,
            createdAt,
            status: normalizedStatus,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortBy: normalizedSortBy,
            sortOrder: normalizedSortOrder,
            favoritesFirst: normalizedFavoritesFirst,
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            searchFeaturesSchema.$id,
            serializeDates({
                features,
                total,
            }),
        );
    }
}
