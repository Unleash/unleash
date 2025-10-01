import type { Response } from 'express';
import type { AuthedRequest } from '../types/core.js';
import type { IUnleashServices } from '../services/index.js';
import { IAuthType, type IUnleashConfig } from '../types/option.js';
import version from '../util/version.js';
import Controller from '../routes/controller.js';
import type VersionService from '../services/version-service.js';
import type SettingService from '../services/setting-service.js';
import {
    type SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../types/settings/simple-auth-settings.js';
import { ADMIN, NONE, UPDATE_CORS } from '../types/permissions.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import {
    uiConfigSchema,
    type UiConfigSchema,
} from '../openapi/spec/ui-config-schema.js';
import type { OpenApiService } from '../services/openapi-service.js';
import type { EmailService } from '../services/email-service.js';
import { emptyResponse } from '../openapi/util/standard-responses.js';
import type { IAuthRequest } from '../routes/unleash-types.js';
import NotFoundError from '../error/notfound-error.js';
import type { SetCorsSchema } from '../openapi/spec/set-cors-schema.js';
import { createRequestSchema } from '../openapi/util/create-request-schema.js';
import type { FrontendApiService, SessionService } from '../services/index.js';
import type MaintenanceService from '../features/maintenance/maintenance-service.js';
import type { IFlagResolver } from '../types/index.js';
import type { UiConfigService } from './ui-config-service.js';

class UiConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private frontendApiService: FrontendApiService;

    private emailService: EmailService;

    private sessionService: SessionService;

    private maintenanceService: MaintenanceService;

    private flagResolver: IFlagResolver;

    private uiConfigService: UiConfigService;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            emailService,
            openApiService,
            frontendApiService,
            maintenanceService,
            sessionService,
            uiConfigService,
        }: Pick<
            IUnleashServices,
            | 'versionService'
            | 'settingService'
            | 'emailService'
            | 'openApiService'
            | 'frontendApiService'
            | 'maintenanceService'
            | 'clientInstanceService'
            | 'sessionService'
            | 'uiConfigService'
        >,
    ) {
        super(config);
        this.flagResolver = config.flagResolver;
        this.openApiService = openApiService;
        this.uiConfigService = uiConfigService;
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.frontendApiService = frontendApiService;
        this.maintenanceService = maintenanceService;
        this.sessionService = sessionService;

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
                    operationId: 'setCors',
                    requestBody: createRequestSchema('setCorsSchema'),
                    responses: { 204: emptyResponse },
                }),
            ],
        });
    }

    async getUiConfig(
        req: AuthedRequest,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
        if (this.flagResolver.isEnabled('newUiConfigService')) {
            const uiConfig = await this.uiConfigService.getUiConfig(req.user);

            return this.openApiService.respondWithValidation(
                200,
                res,
                uiConfigSchema.$id,
                uiConfig,
            );
        }

        const getMaxSessionsCount = async () => {
            if (this.flagResolver.isEnabled('showUserDeviceCount')) {
                return this.sessionService.getMaxSessionsCount();
            }
            return 0;
        };

        const [
            frontendSettings,
            simpleAuthSettings,
            maintenanceMode,
            maxSessionsCount,
        ] = await Promise.all([
            this.frontendApiService.getFrontendSettings(false),
            this.settingService.get<SimpleAuthSettings>(simpleAuthSettingsKey),
            this.maintenanceService.isMaintenanceMode(),
            getMaxSessionsCount(),
        ]);

        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type === IAuthType.NONE;

        const expFlags = this.config.flagResolver.getAll({
            email: req.user.email,
        });

        const flags = {
            ...this.config.ui.flags,
            ...expFlags,
        };

        const unleashContext = {
            ...this.flagResolver.getStaticContext(), //clientId etc.
            email: req.user.email,
            userId: req.user.id,
        };

        const response: UiConfigSchema = {
            ...this.config.ui,
            flags,
            version,
            emailEnabled: this.emailService.isEnabled(),
            unleashUrl: this.config.server.unleashUrl,
            baseUriPath: this.config.server.baseUriPath,
            authenticationType: this.config.authentication?.type,
            frontendApiOrigins: frontendSettings.frontendApiOrigins,
            versionInfo: await this.versionService.getVersionInfo(),
            prometheusAPIAvailable: this.config.prometheusApi !== undefined,
            resourceLimits: this.config.resourceLimits,
            disablePasswordAuth,
            maintenanceMode,
            feedbackUriPath: this.config.feedbackUriPath,
            maxSessionsCount,
            unleashContext: unleashContext,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            uiConfigSchema.$id,
            response,
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
