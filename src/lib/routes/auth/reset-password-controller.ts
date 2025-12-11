import type { Request, Response } from 'express';
import Controller from '../controller.js';
import type UserService from '../../services/user-service.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import { NONE } from '../../types/permissions.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    tokenUserSchema,
    type TokenUserSchema,
} from '../../openapi/spec/token-user-schema.js';
import type { EmailSchema } from '../../openapi/spec/email-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';

interface IValidateQuery {
    token: string;
}

interface IChangePasswordBody {
    token: string;
    password: string;
}

interface SessionRequest<PARAMS, QUERY, BODY, K>
    extends Request<PARAMS, QUERY, BODY, K> {
    user?;
}

class ResetPasswordController extends Controller {
    private userService: UserService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            openApiService,
        }: Pick<IUnleashServices, 'userService' | 'openApiService'>,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.userService = userService;
        this.route({
            method: 'get',
            path: '/validate',
            handler: this.validateToken,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Validates a token',
                    description:
                        'If the token is valid returns the user that owns the token',
                    tags: ['Auth'],
                    operationId: 'validateToken',
                    responses: {
                        200: createResponseSchema('tokenUserSchema'),
                        ...getStandardResponses(401, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/password',
            handler: this.changePassword,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: `Changes a user password`,
                    description:
                        'Allows users with a valid reset token to reset their password without remembering their old password',
                    operationId: 'changePassword',
                    requestBody: createRequestSchema('changePasswordSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate-password',
            handler: this.validatePassword,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Validates password',
                    description:
                        'Verifies that the password adheres to the [Unleash password guidelines](https://docs.getunleash.io/using-unleash/deploy/configuring-unleash#securing-unleash)',
                    operationId: 'validatePassword',
                    requestBody: createRequestSchema('validatePasswordSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/password-email',
            handler: this.sendResetPasswordEmail,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Reset password',
                    description:
                        'Requests a password reset email for the user. This email can be used to reset the password for a user that has forgotten their password',
                    operationId: 'sendResetPasswordEmail',
                    requestBody: createRequestSchema('emailSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404, 415),
                    },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.rateLimiting.passwordResetMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
    }

    async sendResetPasswordEmail(
        req: Request<unknown, unknown, EmailSchema>,
        res: Response,
    ): Promise<void> {
        const { email } = req.body;

        await this.userService.createResetPasswordEmail(email);
        res.status(200).end();
    }

    async validatePassword(req: Request, res: Response): Promise<void> {
        const { password } = req.body;

        this.userService.validatePassword(password);
        res.status(200).end();
    }

    async validateToken(
        req: Request<unknown, unknown, unknown, IValidateQuery>,
        res: Response<TokenUserSchema>,
    ): Promise<void> {
        const { token } = req.query;
        const user = await this.userService.getUserForToken(token);
        await this.logout(req);
        this.openApiService.respondWithValidation<TokenUserSchema>(
            200,
            res,
            tokenUserSchema.$id,
            user,
        );
    }

    async changePassword(
        req: Request<unknown, unknown, IChangePasswordBody, unknown>,
        res: Response,
    ): Promise<void> {
        await this.logout(req);
        const { token, password } = req.body;
        await this.userService.resetPassword(token, password);
        res.status(200).end();
    }

    private async logout(req: SessionRequest<any, any, any, any>) {
        if (req.session) {
            req.session.destroy(() => {});
        }
    }
}

export default ResetPasswordController;
