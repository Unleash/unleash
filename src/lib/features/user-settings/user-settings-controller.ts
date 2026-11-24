import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import { NONE } from '../../types/permissions.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { UserSettingsSchema } from '../../openapi/spec/user-settings-schema.js';
import { ForbiddenError } from '../../error/index.js';
import { requireFeatureEnabled } from '../../middleware/conditional-middleware.js';

export default class UserSettingsController extends Controller {
    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);

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

    async saveUserSettings(
        req: IAuthRequest<unknown, unknown, UserSettingsSchema>,
        res: Response,
    ): Promise<void> {
        if (!req.user.id) {
            throw new ForbiddenError(
                'This endpoint requires an authenticated user.',
            );
        }
        res.status(204).end();
    }
}
