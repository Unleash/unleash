import type { Response } from 'express';
import type { OpenApiService } from '../../services/openapi-service.js';
import type { Logger } from '../../logger.js';
import type { IUnleashConfig } from '../../types/index.js';
import type UserService from '../../services/user-service.js';
import type { IUnleashServices } from '../../services/index.js';
import { NONE } from '../../types/permissions.js';
import Controller from '../controller.js';
import type { IAuthRequest } from '../unleash-types.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import { userSchema, type UserSchema } from '../../openapi/spec/user-schema.js';
import type { LoginSchema } from '../../openapi/spec/login-schema.js';
import { serializeDates } from '../../types/serialize-dates.js';
import { getStandardResponses } from '../../openapi/index.js';

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
                    summary: 'Log in',
                    description:
                        'Logs in the user and creates an active session',
                    operationId: 'login',
                    requestBody: createRequestSchema('loginSchema'),
                    responses: {
                        200: createResponseSchema('userSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });
    }

    async login(
        req: IAuthRequest<{}, void, LoginSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { username, password } = req.body;
        const userAgent = req.get('user-agent');

        const { isAPI, ...user } = await this.userService.loginUser(
            username,
            password,
            {
                userAgent,
                ip: req.ip,
            },
        );
        req.session.user = user;
        this.openApiService.respondWithValidation(
            200,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }
}
