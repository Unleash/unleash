import { Response } from 'express';
import Controller from '../controller';
import { FavoritesService, OpenApiService } from '../../services';
import { Logger } from '../../logger';
import { IUnleashConfig, IUnleashServices, NONE } from '../../types';
import { emptyResponse } from '../../openapi';
import { IAuthRequest } from '../unleash-types';

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
                    responses: { 200: emptyResponse },
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
                    responses: { 200: emptyResponse },
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
                    operationId: 'addFavoriteProject',
                    responses: { 200: emptyResponse },
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
                    operationId: 'removeFavoriteProject',
                    responses: { 200: emptyResponse },
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
        await this.favoritesService.addFavoriteFeature({
            feature: featureName,
            userId: user.id,
        });
        res.status(200).end();
    }

    async removeFavoriteFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const { user } = req;
        await this.favoritesService.removeFavoriteFeature({
            feature: featureName,
            userId: user.id,
        });
        res.status(200).end();
    }

    async addFavoriteProject(
        req: IAuthRequest<{ projectId: string }>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { user } = req;
        await this.favoritesService.addFavoriteProject({
            project: projectId,
            userId: user.id,
        });
        res.status(200).end();
    }

    async removeFavoriteProject(
        req: IAuthRequest<{ projectId: string }>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { user } = req;
        await this.favoritesService.removeFavoriteProject({
            project: projectId,
            userId: user.id,
        });
        res.status(200).end();
    }
}
