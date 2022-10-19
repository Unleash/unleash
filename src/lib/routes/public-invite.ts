import { Response } from 'express';

import Controller from './controller';
import { NONE } from '../types/permissions';
import { Logger } from '../logger';
import { IAuthRequest } from './unleash-types';
import { IUnleashConfig, IUnleashServices } from '../types';
import { OpenApiService } from '../services/openapi-service';
import { createRequestSchema } from '../openapi/util/create-request-schema';
import { createResponseSchema } from '../openapi/util/create-response-schema';
import { serializeDates } from '../types/serialize-dates';
import {
    emptyResponse,
    getStandardResponses,
} from '../openapi/util/standard-responses';
import { PublicSignupTokenService } from '../services/public-signup-token-service';
import { UserSchema, userSchema } from '../openapi/spec/user-schema';
import { CreateInvitedUserSchema } from '../openapi/spec/create-invited-user-schema';

interface TokenParam {
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
                    summary: `Check whether a public sign-up token exists, has not expired and is enabled`,
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
                    summary:
                        'Create a user with the "viewer" root role and link them to a signup token',
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
            return res.status(200).end();
        } else {
            return res.status(400).end();
        }
    }

    async addTokenUser(
        req: IAuthRequest<TokenParam, void, CreateInvitedUserSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { token } = req.params;
        const valid = await this.publicSignupTokenService.validate(token);
        if (!valid) {
            return res.status(400).end();
        }
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
}
