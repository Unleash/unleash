import type { Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import Controller from '../controller.js';
import type { Logger } from '../../logger.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type UserFeedbackService from '../../services/user-feedback-service.js';
import type { IAuthRequest } from '../unleash-types.js';
import { NONE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import type { FeedbackCreateSchema } from '../../openapi/spec/feedback-create-schema.js';
import type { FeedbackUpdateSchema } from '../../openapi/spec/feedback-update-schema.js';
import type { FeedbackResponseSchema } from '../../openapi/spec/feedback-response-schema.js';
import { serializeDates } from '../../types/serialize-dates.js';
import { parseISO } from 'date-fns';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import BadDataError from '../../error/bad-data-error.js';
import {
    feedbackResponseSchema,
    getStandardResponses,
} from '../../openapi/index.js';

type FeedbackIdParam = ParamsDictionary & {
    id: string;
};

class UserFeedbackController extends Controller {
    private logger: Logger;

    private userFeedbackService: UserFeedbackService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            userFeedbackService,
            openApiService,
        }: Pick<IUnleashServices, 'userFeedbackService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('feedback-controller.ts');
        this.userFeedbackService = userFeedbackService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.createFeedback,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'createFeedback',
                    summary: 'Send Unleash feedback',
                    description:
                        'Sends feedback gathered from the Unleash UI to the Unleash server. Must be called with a token with an identifiable user (either from being sent from the UI or from using a [PAT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens)).',
                    requestBody: createRequestSchema('feedbackCreateSchema'),
                    responses: {
                        200: createResponseSchema('feedbackResponseSchema'),
                        ...getStandardResponses(400, 401, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateFeedback,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'updateFeedback',
                    summary: 'Update Unleash feedback',
                    description:
                        'Updates the feedback with the provided ID. Only provided fields are updated. Fields left out are left untouched. Must be called with a token with an identifiable user (either from being sent from the UI or from using a [PAT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens)).',
                    requestBody: createRequestSchema('feedbackUpdateSchema'),
                    responses: {
                        200: createResponseSchema('feedbackResponseSchema'),
                        ...getStandardResponses(400, 401, 415),
                    },
                }),
            ],
        });
    }

    private async createFeedback(
        req: IAuthRequest<ParamsDictionary, unknown, FeedbackCreateSchema>,
        res: Response<FeedbackResponseSchema>,
    ): Promise<void> {
        if (!req.body.feedbackId) {
            throw new BadDataError('Missing feedbackId');
        }

        const updated = await this.userFeedbackService.updateFeedback({
            feedbackId: req.body.feedbackId,
            userId: req.user.id,
            given: new Date(),
            neverShow: req.body.neverShow || false,
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            feedbackResponseSchema.$id,
            serializeDates(updated),
        );
    }

    private async updateFeedback(
        req: IAuthRequest<FeedbackIdParam, unknown, FeedbackUpdateSchema>,
        res: Response<FeedbackResponseSchema>,
    ): Promise<void> {
        const updated = await this.userFeedbackService.updateFeedback({
            feedbackId: req.params.id,
            userId: req.user.id,
            neverShow: req.body.neverShow || false,
            given: (req.body.given && parseISO(req.body.given)) || new Date(),
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            feedbackResponseSchema.$id,
            serializeDates(updated),
        );
    }
}
export default UserFeedbackController;
