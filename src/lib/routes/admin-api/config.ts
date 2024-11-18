import type { Response } from 'express';
import type { AuthedRequest } from '../../types/core';
import type { IUnleashServices } from '../../types/services';
import { IAuthType, type IUnleashConfig } from '../../types/option';
import version from '../../util/version';
import Controller from '../controller';
import type VersionService from '../../services/version-service';
import type SettingService from '../../services/setting-service';
import {
    type SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../../types/settings/simple-auth-settings';
import { ADMIN, NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    uiConfigSchema,
    type UiConfigSchema,
} from '../../openapi/spec/ui-config-schema';
import type { OpenApiService } from '../../services/openapi-service';
import type { EmailService } from '../../services/email-service';
import { emptyResponse } from '../../openapi/util/standard-responses';
import type { IAuthRequest } from '../unleash-types';
import NotFoundError from '../../error/notfound-error';
import type { SetUiConfigSchema } from '../../openapi/spec/set-ui-config-schema';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import type { FrontendApiService, SessionService } from '../../services';
import type MaintenanceService from '../../features/maintenance/maintenance-service';
import type ClientInstanceService from '../../features/metrics/instance/instance-service';
import type { IFlagResolver } from '../../types';

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private frontendApiService: FrontendApiService;

    private emailService: EmailService;

    private clientInstanceService: ClientInstanceService;

    private sessionService: SessionService;

    private maintenanceService: MaintenanceService;

    private flagResolver: IFlagResolver;

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
            clientInstanceService,
            sessionService,
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
        >,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.openApiService = openApiService;
        this.frontendApiService = frontendApiService;
        this.maintenanceService = maintenanceService;
        this.clientInstanceService = clientInstanceService;
        this.sessionService = sessionService;
        this.flagResolver = config.flagResolver;
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
            path: '',
            handler: this.setUiConfig,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    summary: 'Set UI configuration',
                    description:
                        'Sets the UI configuration for this Unleash instance.',
                    operationId: 'setUiConfig',
                    requestBody: createRequestSchema('setUiConfigSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async getUiConfig(
        req: AuthedRequest,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
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

        const response: UiConfigSchema = {
            ...this.config.ui,
            flags,
            version,
            emailEnabled: this.emailService.isEnabled(),
            unleashUrl: this.config.server.unleashUrl,
            baseUriPath: this.config.server.baseUriPath,
            authenticationType: this.config.authentication?.type,
            segmentValuesLimit: this.config.resourceLimits.segmentValues,
            strategySegmentsLimit: this.config.resourceLimits.strategySegments,
            frontendApiOrigins: frontendSettings.frontendApiOrigins,
            versionInfo: await this.versionService.getVersionInfo(),
            networkViewEnabled: this.config.prometheusApi !== undefined,
            resourceLimits: this.config.resourceLimits,
            disablePasswordAuth,
            maintenanceMode,
            feedbackUriPath: this.config.feedbackUriPath,
            unleashAIAvailable: this.config.openAIAPIKey !== undefined,
            maxSessionsCount,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            uiConfigSchema.$id,
            response,
        );
    }

    async setUiConfig(
        req: IAuthRequest<void, void, SetUiConfigSchema>,
        res: Response<string>,
    ): Promise<void> {
        if (req.body.frontendSettings) {
            await this.frontendApiService.setFrontendSettings(
                req.body.frontendSettings,
                req.audit,
            );
            res.sendStatus(204);
            return;
        }

        throw new NotFoundError();
    }
}

export default ConfigController;
