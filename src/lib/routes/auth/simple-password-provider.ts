import { Response } from 'express';
import { OpenApiService } from '../../services/openapi-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import UserService from '../../services/user-service';
import { IUnleashServices } from '../../types';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { IAuthRequest } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { userSchema, UserSchema } from '../../openapi/spec/user-schema';
import { LoginSchema } from '../../openapi/spec/login-schema';
import { serializeDates } from '../../types/serialize-dates';

export class SimplePasswordProvider extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private userService: UserService;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            openApiService,
        }: Pick<IUnleashServices, 'userService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/auth/password-provider.js');
        this.openApiService = openApiService;
        this.userService = userService;

        this.route({
            method: 'post',
            path: '/login',
            handler: this.login,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    operationId: 'login',
                    requestBody: createRequestSchema('loginSchema'),
                    responses: {
                        200: createResponseSchema('userSchema'),
                    },
                }),
            ],
        });
    }

    async login(
        req: IAuthRequest<void, void, LoginSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { username, password } = req.body;

        const user = await this.userService.loginUser(username, password);
        req.session.user = user;
        this.openApiService.respondWithValidation(
            200,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }
}
