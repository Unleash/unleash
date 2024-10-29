import Controller from '../../routes/controller';
import type { OpenApiService } from '../../services';
import type { UserSettingsService } from './user-settings-service';
import type {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../types';
import {
    createRequestSchema,
    createResponseSchema,
    getStandardResponses,
} from '../../openapi';
import { ForbiddenError } from '../../error';

export default class UserSettingsController extends Controller {
    private userSettingsService: UserSettingsService;

    private flagResolver: IFlagResolver;

    private openApiService: OpenApiService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.userSettingsService = services.userSettingsService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUserSettings,
            permission: 'user',
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unstable'], // TODO: Remove this tag when the endpoint is stable
                    operationId: 'getUserSettings',
                    summary: 'Get user settings',
                    description:
                        'Get the settings for the currently authenticated user.',
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
            handler: this.updateUserSettings,
            permission: 'user',
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unstable'], // TODO: Update/remove when endpoint stabilizes
                    operationId: 'updateUserSettings',
                    summary: 'Update user settings',
                    description: 'Update a specific user setting by key.',
                    requestBody: createRequestSchema('setUserSettingSchema'),
                    responses: {
                        204: { description: 'Setting updated successfully' },
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                }),
            ],
        });
    }

    async getUserSettings(req, res) {
        if (!this.flagResolver.isEnabled('userSettings')) {
            throw new ForbiddenError('User settings feature is not enabled');
        }
        const { user } = req;
        const settings = await this.userSettingsService.getAll(user.id);
        res.json(settings);
    }

    async updateUserSettings(req, res) {
        if (!this.flagResolver.isEnabled('userSettings')) {
            throw new ForbiddenError('User settings feature is not enabled');
        }
        const { user } = req;
        const { key, value } = req.body;
        const allowedSettings = ['productivity-insights-email'];

        if (!allowedSettings.includes(key)) {
            res.status(400).json({
                message: `Invalid setting key`,
            });
            return;
        }

        await this.userSettingsService.set(user.id, key, value, user);
        res.status(204).end();
    }
}
