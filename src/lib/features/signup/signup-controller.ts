import type { Response } from 'express';
import {
    createRequestSchema,
    emptyResponse,
    getStandardResponses,
    signupDataSchema,
    type SignupDataSchema,
    type SubmitSignupDataSchema,
} from '../../openapi/index.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import type { IUnleashConfig } from '../../types/option.js';
import { NONE } from '../../types/permissions.js';
import type { IUnleashServices } from '../../services/index.js';
import type { SignupService } from './signup-service.js';

export default class SignupController extends Controller {
    private signupService: SignupService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            signupService,
            openApiService,
        }: Pick<IUnleashServices, 'signupService' | 'openApiService'>,
    ) {
        super(config);
        this.signupService = signupService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getSignupData,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getSignupData',
                    tags: ['Signup'],
                    release: {
                        beta: '7.5',
                        stable: '7.6',
                    },
                    summary: 'Get signup data',
                    description:
                        'Returns the signup data for the current user.',
                    responses: {
                        200: createResponseSchema('signupDataSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.submitSignupData,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'submitSignupData',
                    tags: ['Signup'],
                    release: {
                        beta: '7.5',
                        stable: '7.6',
                    },
                    summary: 'Submit signup data.',
                    description:
                        'Submits the signup data for the current user.',
                    requestBody: createRequestSchema('submitSignupDataSchema'),
                    responses: {
                        ...getStandardResponses(400, 404),
                        204: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getSignupData(
        { user }: IAuthRequest,
        res: Response<SignupDataSchema>,
    ): Promise<void> {
        const signupData = await this.signupService.getSignupData(user);

        this.openApiService.respondWithValidation(
            200,
            res,
            signupDataSchema.$id,
            signupData,
        );
    }

    async submitSignupData(
        req: IAuthRequest<unknown, unknown, SubmitSignupDataSchema>,
        res: Response,
    ): Promise<void> {
        const { user, audit, body } = req;
        await this.signupService.submitSignupData(user, body, audit);
        delete req.user.shouldSetPassword;
        res.status(204).send();
    }
}
