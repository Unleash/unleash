import { Response } from 'express';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services';
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

interface ISearchQueryParams {
    query: string;
    tags: string[];
}

const PATH = '/features';

type FeatureSearchServices = Pick<IUnleashServices, 'openApiService'>;

export default class FeatureSearchController extends Controller {
    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        { openApiService }: FeatureSearchServices,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
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
                    responses: {
                        200: createResponseSchema('searchFeaturesSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async searchFeatures(
        req: IAuthRequest<any, any, any, ISearchQueryParams>,
        res: Response,
    ): Promise<void> {
        const { query, tags } = req.query;

        if (this.config.flagResolver.isEnabled('featureSearchAPI')) {
            res.json({ features: [] });
        } else {
            throw new InvalidOperationError(
                'Feature Search API is not enabled',
            );
        }
    }
}
