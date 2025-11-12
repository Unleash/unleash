import type { Response } from 'express';

import Controller from './controller.js';
import { NONE } from '../types/permissions.js';
import type { Logger } from '../logger.js';
import type { IAuthRequest } from './unleash-types.js';
import type { IUnleashConfig } from '../types/index.js';
import type { OpenApiService } from '../services/openapi-service.js';
import { createRequestSchema } from '../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import { serializeDates } from '../types/serialize-dates.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../openapi/util/standard-responses.js';
import type { PublicSignupTokenService } from '../services/public-signup-token-service.js';
import { type UserSchema, userSchema } from '../openapi/spec/user-schema.js';
import type { CreateInvitedUserSchema } from '../openapi/spec/create-invited-user-schema.js';
import type { IUnleashServices } from '../services/index.js';

interface TokenParam extends Record<string, string> {
    token: string;
}

export class PublicInviteController extends Controller {
    private publicSignupTokenService: PublicSignupTokenService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            publicSignupTokenService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'publicSignupTokenService' | 'openApiService'
        >,
    ) {
        super(config);
        this.publicSignupTokenService = publicSignupTokenService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('validate-invite-token-controller.js');

        this.route({
            method: 'get',
            path: '/:token/validate',
            handler: this.validate,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'validatePublicSignupToken',
                    summary: `Validate signup token`,
                    description: `Check whether the provided public sign-up token exists, has not expired and is enabled`,
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:token/signup',
            handler: this.addTokenUser,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'addPublicSignupTokenUser',
                    summary: 'Add a user via a signup token',
                    description:
                        'Create a user with the viewer root role and link them to the provided signup token',
                    requestBody: createRequestSchema('createInvitedUserSchema'),
                    responses: {
                        200: createResponseSchema('userSchema'),
                        ...getStandardResponses(400, 409),
                    },
                }),
            ],
        });
    }

    async validate(
        req: IAuthRequest<TokenParam, void>,
        res: Response,
    ): Promise<void> {
        const { token } = req.params;
        const valid = await this.publicSignupTokenService.validate(token);
        if (valid) {
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    }

    async addTokenUser(
        req: IAuthRequest<TokenParam, void, CreateInvitedUserSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { token } = req.params;
        const valid = await this.publicSignupTokenService.validate(token);
        if (!valid) {
            res.status(400).end();
            return;
        }
        const { isAPI, ...user } =
            await this.publicSignupTokenService.addTokenUser(
                token,
                req.body,
                req.audit,
            );
        this.openApiService.respondWithValidation(
            201,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }
}
