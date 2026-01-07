import type { Response } from 'express';
import Controller from '../controller.js';
import type {
    FavoritesService,
    IUnleashServices,
    OpenApiService,
} from '../../services/index.js';
import type { Logger } from '../../logger.js';
import { type IUnleashConfig, NONE } from '../../types/index.js';
import { emptyResponse, getStandardResponses } from '../../openapi/index.js';
import type { IAuthRequest } from '../unleash-types.js';

export default class FavoritesController extends Controller {
    private favoritesService: FavoritesService;

    private logger: Logger;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            favoritesService,
            openApiService,
        }: Pick<IUnleashServices, 'favoritesService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/routes/favorites-controller');
        this.favoritesService = favoritesService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '/:projectId/features/:featureName/favorites',
            handler: this.addFavoriteFeature,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'addFavoriteFeature',
                    summary: 'Add feature to favorites',
                    description:
                        'This endpoint marks the feature in the url as favorite',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:projectId/features/:featureName/favorites',
            handler: this.removeFavoriteFeature,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'removeFavoriteFeature',
                    summary: 'Remove feature from favorites',
                    description:
                        'This endpoint removes the feature in the url from favorites',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:projectId/favorites',
            handler: this.addFavoriteProject,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Add project to favorites',
                    description:
                        'This endpoint marks the project in the url as favorite',
                    operationId: 'addFavoriteProject',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:projectId/favorites',
            handler: this.removeFavoriteProject,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Remove project from favorites',
                    description:
                        'This endpoint removes the project in the url from favorites',
                    operationId: 'removeFavoriteProject',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });
    }

    async addFavoriteFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const { user } = req;
        await this.favoritesService.favoriteFeature(
            {
                feature: featureName,
                user,
            },
            req.audit,
        );
        res.status(200).end();
    }

    async removeFavoriteFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const { user } = req;
        await this.favoritesService.unfavoriteFeature(
            {
                feature: featureName,
                user,
            },
            req.audit,
        );
        res.status(200).end();
    }

    async addFavoriteProject(
        req: IAuthRequest<{ projectId: string }>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { user } = req;
        await this.favoritesService.favoriteProject(
            {
                project: projectId,
                user,
            },
            req.audit,
        );
        res.status(200).end();
    }

    async removeFavoriteProject(
        req: IAuthRequest<{ projectId: string }>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { user } = req;
        await this.favoritesService.unfavoriteProject(
            {
                project: projectId,
                user: user,
            },
            req.audit,
        );
        res.status(200).end();
    }
}
