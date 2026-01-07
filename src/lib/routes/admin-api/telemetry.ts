import type { Response } from 'express';
import type { OpenApiService } from '../../services/index.js';
import type { IAuthRequest } from '../unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import Controller from '../controller.js';
import { NONE } from '../../types/permissions.js';
import type { IUnleashServices } from '../../services/index.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import {
    telemetrySettingsSchema,
    type TelemetrySettingsSchema,
} from '../../openapi/spec/telemetry-settings-schema.js';

class TelemetryController extends Controller {
    openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '/settings',
            handler: this.getTelemetrySettings,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Telemetry'],
                    summary: 'Get telemetry settings',
                    description:
                        'Provides the configured settings for [telemetry information collection](https://docs.getunleash.io/topics/data-collection)',
                    operationId: 'getTelemetrySettings',
                    responses: {
                        200: createResponseSchema('telemetrySettingsSchema'),
                    },
                }),
            ],
        });
    }

    async getTelemetrySettings(
        _req: IAuthRequest,
        res: Response<TelemetrySettingsSchema>,
    ): Promise<void> {
        this.openApiService.respondWithValidation(
            200,
            res,
            telemetrySettingsSchema.$id,
            {
                versionInfoCollectionEnabled: this.config.versionCheck.enable,
                featureInfoCollectionEnabled: this.config.telemetry,
            },
        );
    }
}

export default TelemetryController;
