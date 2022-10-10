import { Response } from 'express';

import Controller from '../controller';
import { ADMIN } from '../../types/permissions';
import { Logger } from '../../logger';
import { AccessService } from '../../services/access-service';
import { IAuthRequest } from '../unleash-types';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../types/serialize-dates';
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
                    summary: 'Retrieve all existing public signup tokens',
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
                    summary: 'Create a public signup token',
                    requestBody: createRequestSchema(
                        'publicSignupTokenCreateSchema',
                    ),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'publicSignupTokenSchema',
                        ),
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
                    summary: 'Retrieve a token',
                    description:
                        "Get information about a specific token. The `:token` part of the URL should be the token's secret.",
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
                    summary: 'Update a public signup token',
                    requestBody: createRequestSchema(
                        'publicSignupTokenUpdateSchema',
                    ),
                    responses: {
                        200: createResponseSchema('publicSignupTokenSchema'),
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
            { location: `tokens/${token.secret}` },
        );
    }

    async updatePublicSignupToken(
        req: IAuthRequest<TokenParam, void, PublicSignupTokenUpdateSchema>,
        res: Response,
    ): Promise<any> {
        const { token } = req.params;
        const { expiresAt, enabled } = req.body;

        if (!expiresAt && enabled === undefined) {
            this.logger.error(req.body);
            return res.status(400).send();
        }

        const result = await this.publicSignupTokenService.update(
            token,
            {
                ...(enabled === undefined ? {} : { enabled }),
                ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
            },
            extractUsername(req),
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            publicSignupTokenSchema.$id,
            serializeDates(result),
        );
    }
}
