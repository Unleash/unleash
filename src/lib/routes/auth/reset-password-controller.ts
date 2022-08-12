import { Request, Response } from 'express';
import Controller from '../controller';
import UserService from '../../services/user-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { NONE } from '../../types/permissions';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { OpenApiService } from '../../services/openapi-service';
import {
    tokenUserSchema,
    TokenUserSchema,
} from '../../openapi/spec/token-user-schema';
import { EmailSchema } from '../../openapi/spec/email-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';

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

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            openApiService,
        }: Pick<IUnleashServices, 'userService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger(
            'lib/routes/auth/reset-password-controller.ts',
        );
        this.openApiService = openApiService;
        this.userService = userService;
        this.route({
            method: 'get',
            path: '/validate',
            handler: this.validateToken,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    operationId: 'validateToken',
                    responses: { 200: createResponseSchema('tokenUserSchema') },
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
                    operationId: 'changePassword',
                    requestBody: createRequestSchema('changePasswordSchema'),
                    responses: { 200: emptyResponse },
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
                    operationId: 'validatePassword',
                    requestBody: createRequestSchema('validatePasswordSchema'),
                    responses: { 200: emptyResponse },
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
                    operationId: 'sendResetPasswordEmail',
                    requestBody: createRequestSchema('emailSchema'),
                    responses: { 200: emptyResponse },
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
