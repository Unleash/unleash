import { Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserFeedbackService from '../../services/user-feedback-service';
import { IAuthRequest } from '../unleash-types';
import { NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import {
    feedbackSchema,
    FeedbackSchema,
} from '../../openapi/spec/feedback-schema';
import { serializeDates } from '../../types/serialize-dates';
import { parseISO } from 'date-fns';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import BadDataError from '../../error/bad-data-error';
import { getStandardResponses } from '../../openapi';

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
                        'Sends feedback gathered from the Unleash UI to the Unleash server.',
                    requestBody: createRequestSchema('feedbackSchema'),
                    responses: {
                        200: createResponseSchema('feedbackSchema'),
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
                        'Updates the feedback with the provided ID. Only provided fields are updated. Fields left out are left untouched.',
                    requestBody: createRequestSchema('feedbackSchema'),
                    responses: {
                        200: createResponseSchema('feedbackSchema'),
                        ...getStandardResponses(400, 401, 415),
                    },
                }),
            ],
        });
    }

    private async createFeedback(
        req: IAuthRequest<unknown, unknown, FeedbackSchema>,
        res: Response<FeedbackSchema>,
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
            feedbackSchema.$id,
            serializeDates(updated),
        );
    }

    private async updateFeedback(
        req: IAuthRequest<{ id: string }, unknown, FeedbackSchema>,
        res: Response<FeedbackSchema>,
    ): Promise<void> {
        const updated = await this.userFeedbackService.updateFeedback({
            feedbackId: req.params.id,
            userId: req.user.id,
            neverShow: req.body.neverShow || false,
            given: req.body.given && parseISO(req.body.given),
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            feedbackSchema.$id,
            serializeDates(updated),
        );
    }
}

module.exports = UserFeedbackController;
export default UserFeedbackController;
