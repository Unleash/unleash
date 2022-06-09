import { Response } from 'express';
import { IAuthRequest } from '../unleash-types';
import Controller from '../controller';
import { AccessService } from '../../services/access-service';
import { IAuthType, IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserService from '../../services/user-service';
import UserFeedbackService from '../../services/user-feedback-service';
import UserSplashService from '../../services/user-splash-service';
import { ADMIN, NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema, createResponseSchema } from '../../openapi';
import { emptyResponse } from '../../openapi/spec/empty-response';
import { meSchema, MeSchema } from '../../openapi/spec/me-schema';
import { serializeDates } from '../../types/serialize-dates';
import { IUserPermission } from '../../types/stores/access-store';
import { PasswordSchema } from '../../openapi/spec/password-schema';

class UserController extends Controller {
    private accessService: AccessService;

    private userService: UserService;

    private userFeedbackService: UserFeedbackService;

    private userSplashService: UserSplashService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            accessService,
            userService,
            userFeedbackService,
            userSplashService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'accessService'
            | 'userService'
            | 'userFeedbackService'
            | 'userSplashService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.accessService = accessService;
        this.userService = userService;
        this.userFeedbackService = userFeedbackService;
        this.userSplashService = userSplashService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getMe,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'getMe',
                    responses: { 200: createResponseSchema('meSchema') },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/change-password',
            handler: this.changeMyPassword,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'changeMyPassword',
                    requestBody: createRequestSchema('passwordSchema'),
                    responses: {
                        200: emptyResponse,
                        400: { description: 'passwordMismatch' },
                    },
                }),
            ],
        });
    }

    async getMe(req: IAuthRequest, res: Response<MeSchema>): Promise<void> {
        res.setHeader('cache-control', 'no-store');
        const { user } = req;
        let permissions: IUserPermission[];
        if (this.config.authentication.type === IAuthType.NONE) {
            permissions = [{ permission: ADMIN }];
        } else {
            permissions = await this.accessService.getPermissionsForUser(user);
        }
        const feedback = await this.userFeedbackService.getAllUserFeedback(
            user,
        );
        const splash = await this.userSplashService.getAllUserSplashs(user);

        const responseData: MeSchema = {
            user: serializeDates(user),
            permissions,
            feedback: serializeDates(feedback),
            splash,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            meSchema.$id,
            responseData,
        );
    }

    async changeMyPassword(
        req: IAuthRequest<unknown, unknown, PasswordSchema>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { password, confirmPassword } = req.body;
        if (password === confirmPassword) {
            this.userService.validatePassword(password);
            await this.userService.changePassword(user.id, password);
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    }
}

module.exports = UserController;
export default UserController;
