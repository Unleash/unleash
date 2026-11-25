import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { NONE } from '../../types/permissions.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import {
    type UserSettingsSchema,
    userSettingsSchema,
} from '../../openapi/spec/user-settings-schema.js';
import { ForbiddenError } from '../../error/index.js';
import { requireFeatureEnabled } from '../../middleware/conditional-middleware.js';
import type { UserSettingsService } from './user-settings-service.js';

export default class UserSettingsController extends Controller {
    private userSettingsService: UserSettingsService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            userSettingsService,
        }: Pick<IUnleashServices, 'openApiService' | 'userSettingsService'>,
    ) {
        super(config);
        this.userSettingsService = userSettingsService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUserSettings,
            permission: NONE,
            middleware: [
                requireFeatureEnabled(config.flagResolver, 'userSettings'),
                openApiService.validPath({
                    tags: ['Admin UI'],
                    release: { alpha: true },
                    operationId: 'getUserSettings',
                    summary: 'Get settings of the current user',
                    description:
                        'Returns the saved settings of the current user, in the same shape as they are saved. A setting saved with a `null` value is returned with a `null` value, while a setting never saved, or whose expiry has passed, is left out. Only callers signed in as a user, or using a personal access token, can read settings; admin API tokens are refused.',
                    responses: {
                        200: createResponseSchema('userSettingsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '',
            handler: this.saveUserSettings,
            permission: NONE,
            middleware: [
                requireFeatureEnabled(config.flagResolver, 'userSettings'),
                openApiService.validPath({
                    tags: ['Admin UI'],
                    release: { alpha: true },
                    operationId: 'saveUserSettings',
                    summary: 'Save settings of the current user',
                    description:
                        'Saves the given settings for the current user. Keys are free-form and values are any JSON. Only callers signed in as a user, or using a personal access token, can save settings; admin API tokens are refused.',
                    requestBody: createRequestSchema('userSettingsSchema'),
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });
    }

    async getUserSettings(
        req: IAuthRequest,
        res: Response<UserSettingsSchema>,
    ): Promise<void> {
        if (!req.user.id) {
            throw new ForbiddenError(
                'This endpoint requires an authenticated user.',
            );
        }
        this.openApiService.respondWithValidation(
            200,
            res,
            userSettingsSchema.$id,
            { settings: {} },
        );
    }

    async saveUserSettings(
        req: IAuthRequest<unknown, unknown, UserSettingsSchema>,
        res: Response,
    ): Promise<void> {
        if (!req.user.id) {
            throw new ForbiddenError(
                'This endpoint requires an authenticated user.',
            );
        }
        await this.userSettingsService.saveSettings(
            req.user,
            req.body.settings,
        );
        res.status(204).end();
    }
}
