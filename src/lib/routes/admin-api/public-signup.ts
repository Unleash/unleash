import { Response } from 'express';

import Controller from '../controller';
import { ADMIN, NONE } from '../../types/permissions';
import { Logger } from '../../logger';
import { AccessService } from '../../services/access-service';
import { IAuthRequest } from '../unleash-types';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../types/serialize-dates';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { PublicSignupTokenService } from '../../services/public-signup-token-service';
import UserService from '../../services/user-service';
import {
    publicSignupTokenSchema,
    PublicSignupTokenSchema,
} from '../../openapi/spec/public-signup-token-schema';
import {
    publicSignupTokensSchema,
    PublicSignupTokensSchema,
} from '../../openapi/spec/public-signup-tokens-schema';
import { PublicSignupTokenCreateSchema } from '../../openapi/spec/public-signup-token-create-schema';
import { PublicSignupTokenUpdateSchema } from '../../openapi/spec/public-signup-token-update-schema';
import { CreateUserSchema } from '../../openapi/spec/create-user-schema';
import { UserSchema, userSchema } from '../../openapi/spec/user-schema';
import { extractUsername } from '../../util/extract-user';

interface TokenParam {
    token: string;
}

export class PublicSignupController extends Controller {
    private publicSignupTokenService: PublicSignupTokenService;

    private userService: UserService;

    private accessService: AccessService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            publicSignupTokenService,
            accessService,
            userService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'publicSignupTokenService'
            | 'accessService'
            | 'userService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.publicSignupTokenService = publicSignupTokenService;
        this.accessService = accessService;
        this.userService = userService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('public-signup-controller.js');

        this.route({
            method: 'get',
            path: '/tokens',
            handler: this.getAllPublicSignupTokens,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'getAllPublicSignupTokens',
                    responses: {
                        200: createResponseSchema('publicSignupTokensSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/tokens',
            handler: this.createPublicSignupToken,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'createPublicSignupToken',
                    requestBody: createRequestSchema(
                        'publicSignupTokenCreateSchema',
                    ),
                    responses: {
                        201: createResponseSchema('publicSignupTokenSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/tokens/:token/signup',
            handler: this.addTokenUser,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'addPublicSignupTokenUser',
                    requestBody: createRequestSchema('createUserSchema'),
                    responses: {
                        200: createResponseSchema('userSchema'),
                        ...getStandardResponses(409),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/tokens/:token',
            handler: this.getPublicSignupToken,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'getPublicSignupToken',
                    responses: {
                        200: createResponseSchema('publicSignupTokenSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/tokens/:token',
            handler: this.updatePublicSignupToken,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'updatePublicSignupToken',
                    requestBody: createRequestSchema(
                        'publicSignupTokenUpdateSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/tokens/:token',
            handler: this.deletePublicSignupToken,
            acceptAnyContentType: true,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'deletePublicSignupToken',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/tokens/:token/validate',
            handler: this.validate,
            acceptAnyContentType: true,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'validatePublicSignupToken',
                    responses: {
                        200: emptyResponse,
                        401: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getAllPublicSignupTokens(
        req: IAuthRequest,
        res: Response<PublicSignupTokensSchema>,
    ): Promise<void> {
        const tokens = await this.publicSignupTokenService.getAllTokens();
        this.openApiService.respondWithValidation(
            200,
            res,
            publicSignupTokensSchema.$id,
            { tokens: serializeDates(tokens) },
        );
    }

    async getPublicSignupToken(
        req: IAuthRequest<TokenParam>,
        res: Response<PublicSignupTokenSchema>,
    ): Promise<void> {
        const { token } = req.params;
        const result = await this.publicSignupTokenService.get(token);
        this.openApiService.respondWithValidation(
            200,
            res,
            publicSignupTokenSchema.$id,
            serializeDates(result),
        );
    }

    async validate(
        req: IAuthRequest<TokenParam, void, CreateUserSchema>,
        res: Response,
    ): Promise<void> {
        const { token } = req.params;
        const valid = await this.publicSignupTokenService.validate(token);
        if (valid) return res.status(200).end();
        else return res.status(401).end();
    }

    async addTokenUser(
        req: IAuthRequest<TokenParam, void, CreateUserSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { token } = req.params;
        const user = await this.publicSignupTokenService.addTokenUser(
            token,
            req.body,
        );
        this.openApiService.respondWithValidation(
            201,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }

    async createPublicSignupToken(
        req: IAuthRequest<void, void, PublicSignupTokenCreateSchema>,
        res: Response<PublicSignupTokenSchema>,
    ): Promise<void> {
        const username = extractUsername(req);
        const token =
            await this.publicSignupTokenService.createNewPublicSignupToken(
                req.body,
                username,
            );
        this.openApiService.respondWithValidation(
            201,
            res,
            publicSignupTokenSchema.$id,
            serializeDates(token),
        );
    }

    async updatePublicSignupToken(
        req: IAuthRequest<TokenParam, void, PublicSignupTokenUpdateSchema>,
        res: Response,
    ): Promise<any> {
        const { token } = req.params;
        const { expiresAt } = req.body;

        if (!expiresAt) {
            this.logger.error(req.body);
            return res.status(400).send();
        }

        await this.publicSignupTokenService.setExpiry(
            token,
            new Date(expiresAt),
        );
        return res.status(200).end();
    }

    async deletePublicSignupToken(
        req: IAuthRequest<TokenParam>,
        res: Response,
    ): Promise<void> {
        const { token } = req.params;
        const userName = extractUsername(req);

        await this.publicSignupTokenService.delete(token, userName);
        res.status(200).end();
    }
}
