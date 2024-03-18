import type { Response } from 'express';
import Controller from '../controller';
import type { Logger } from '../../logger';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type UserSplashService from '../../services/user-splash-service';
import type { IAuthRequest } from '../unleash-types';
import { NONE } from '../../types/permissions';
import type { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { splashRequestSchema } from '../../openapi/spec/splash-request-schema';
import { getStandardResponses } from '../../openapi';
import type { SplashResponseSchema } from '../../openapi/spec/splash-response-schema';

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
                    summary: 'Update splash settings',
                    description:
                        'This operation updates splash settings for a user, indicating that they have seen a particualar splash screen.',
                    responses: {
                        200: createResponseSchema('splashResponseSchema'),
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }

    private async updateSplashSettings(
        req: IAuthRequest<{ id: string }>,
        res: Response<SplashResponseSchema>,
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
            splashRequestSchema.$id,
            await this.userSplashService.updateSplash(splash),
        );
    }
}

module.exports = UserSplashController;
export default UserSplashController;
