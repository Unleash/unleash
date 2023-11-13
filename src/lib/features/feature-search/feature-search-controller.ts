import { Response } from 'express';
import Controller from '../../routes/controller';
import { FeatureSearchService, OpenApiService } from '../../services';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    NONE,
} from '../../types';
import { Logger } from '../../logger';
import { createResponseSchema, getStandardResponses } from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { InvalidOperationError } from '../../error';
import {
    FeatureSearchQueryParameters,
    featureSearchQueryParameters,
} from '../../openapi/spec/feature-search-query-parameters';

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
        if (this.config.flagResolver.isEnabled('featureSearchAPI')) {
            const {
                query,
                projectId,
                type,
                tag,
                status,
                offset,
                limit = '50',
                sortOrder,
                sortBy,
            } = req.query;
            const userId = req.user.id;
            const normalizedTag = tag?.map((tag) => tag.split(':'));
            const normalizedStatus = status
                ?.map((tag) => tag.split(':'))
                .filter(
                    (tag) =>
                        tag.length === 2 &&
                        ['enabled', 'disabled'].includes(tag[1]),
                );
            const normalizedLimit =
                Number(limit) > 0 && Number(limit) <= 50 ? Number(limit) : 50;
            const normalizedOffset = Number(offset) > 0 ? Number(offset) : 0;
            const normalizedSortBy: string = sortBy ? sortBy : 'createdAt';
            const normalizedSortOrder =
                sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';
            const { features, total } = await this.featureSearchService.search({
                query,
                projectId,
                type,
                userId,
                tag: normalizedTag,
                status: normalizedStatus,
                offset: normalizedOffset,
                limit: normalizedLimit,
                sortBy: normalizedSortBy,
                sortOrder: normalizedSortOrder,
            });

            res.json({ features, total });
        } else {
            throw new InvalidOperationError(
                'Feature Search API is not enabled',
            );
        }
    }
}
