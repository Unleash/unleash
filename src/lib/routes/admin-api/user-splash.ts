import { Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserSplashService from '../../services/user-splash-service';
import { IAuthRequest } from '../unleash-types';
import { NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { splashSchema, SplashSchema } from '../../openapi/spec/splash-schema';

class UserSplashController extends Controller {
    private logger: Logger;

    private userSplashService: UserSplashService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            userSplashService,
            openApiService,
        }: Pick<IUnleashServices, 'userSplashService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('splash-controller.ts');
        this.userSplashService = userSplashService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '/:id',
            acceptAnyContentType: true,
            handler: this.updateSplashSettings,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'updateSplashSettings',
                    responses: { 200: createResponseSchema('splashSchema') },
                }),
            ],
        });
    }

    private async updateSplashSettings(
        req: IAuthRequest<{ id: string }>,
        res: Response<SplashSchema>,
    ): Promise<void> {
        const { user } = req;
        const { id } = req.params;

        const splash = {
            splashId: id,
            userId: user.id,
            seen: true,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            splashSchema.$id,
            await this.userSplashService.updateSplash(splash),
        );
    }
}

module.exports = UserSplashController;
export default UserSplashController;
