import type { Response } from 'express';
import type { IUnleashServices } from '../services/index.js';
import type { IUnleashConfig } from '../types/option.js';
import Controller from '../routes/controller.js';
import { ADMIN, NONE, UPDATE_CORS } from '../types/permissions.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import {
    uiConfigSchema,
    type UiConfigSchema,
} from '../openapi/spec/ui-config-schema.js';
import type { OpenApiService } from '../services/openapi-service.js';
import { emptyResponse } from '../openapi/util/standard-responses.js';
import type { IAuthRequest } from '../routes/unleash-types.js';
import NotFoundError from '../error/notfound-error.js';
import type { SetCorsSchema } from '../openapi/spec/set-cors-schema.js';
import { createRequestSchema } from '../openapi/util/create-request-schema.js';
import type { FrontendApiService } from '../services/index.js';
import type { UiConfigService } from './ui-config-service.js';

class UiConfigController extends Controller {
    private frontendApiService: FrontendApiService;

    private uiConfigService: UiConfigService;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            frontendApiService,
            uiConfigService,
        }: Pick<
            IUnleashServices,
            | 'openApiService'
            | 'frontendApiService'
            | 'clientInstanceService'
            | 'uiConfigService'
        >,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.uiConfigService = uiConfigService;
        this.frontendApiService = frontendApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUiConfig,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    summary: 'Get UI configuration',
                    description:
                        'Retrieves the full configuration used to set up the Unleash Admin UI.',
                    release: { stable: '4.15.0' },
                    operationId: 'getUiConfig',
                    responses: {
                        200: createResponseSchema('uiConfigSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/cors',
            handler: this.setCors,
            permission: [ADMIN, UPDATE_CORS],
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    summary: 'Sets allowed CORS origins',
                    description:
                        'Sets Cross-Origin Resource Sharing headers for Frontend SDK API.',
                    release: { stable: '6.6.0' },
                    operationId: 'setCors',
                    requestBody: createRequestSchema('setCorsSchema'),
                    responses: { 204: emptyResponse },
                }),
            ],
        });
    }

    async getUiConfig(
        req: IAuthRequest,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
        // Only pass the sessionID for logged-in sessions; otherwise it's
        // ephemeral per request and correlates nothing.
        const uiConfig = await this.uiConfigService.getUiConfig(
            req.user,
            req.session?.user ? req.sessionID : undefined,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            uiConfigSchema.$id,
            uiConfig,
        );
    }

    async setCors(
        req: IAuthRequest<void, void, SetCorsSchema>,
        res: Response<string>,
    ): Promise<void> {
        if (req.body.frontendApiOrigins) {
            await this.frontendApiService.setFrontendCorsSettings(
                req.body.frontendApiOrigins,
                req.audit,
            );
            res.sendStatus(204);
            return;
        }

        throw new NotFoundError();
    }
}

export default UiConfigController;
