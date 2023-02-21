import { Response } from 'express';
import { AuthedRequest } from '../../types/core';
import { IUnleashServices } from '../../types/services';
import { IAuthType, IUnleashConfig } from '../../types/option';
import version from '../../util/version';
import Controller from '../controller';
import VersionService from 'lib/services/version-service';
import SettingService from 'lib/services/setting-service';
import {
    simpleAuthSettingsKey,
    SimpleAuthSettings,
} from '../../types/settings/simple-auth-settings';
import { ADMIN, NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    uiConfigSchema,
    UiConfigSchema,
} from '../../openapi/spec/ui-config-schema';
import { OpenApiService } from '../../services/openapi-service';
import { EmailService } from '../../services/email-service';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { IAuthRequest } from '../unleash-types';
import { extractUsername } from '../../util/extract-user';
import NotFoundError from '../../error/notfound-error';
import { SetUiConfigSchema } from '../../openapi/spec/set-ui-config-schema';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { ProxyService } from 'lib/services';
import MaintenanceService from 'lib/services/maintenance-service';

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private proxyService: ProxyService;

    private emailService: EmailService;

    private maintenanceService: MaintenanceService;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            emailService,
            openApiService,
            proxyService,
            maintenanceService,
        }: Pick<
            IUnleashServices,
            | 'versionService'
            | 'settingService'
            | 'emailService'
            | 'openApiService'
            | 'proxyService'
            | 'maintenanceService'
        >,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.openApiService = openApiService;
        this.proxyService = proxyService;
        this.maintenanceService = maintenanceService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUiConfig,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
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
        const [frontendSettings, simpleAuthSettings, maintenanceMode] =
            await Promise.all([
                this.proxyService.getFrontendSettings(false),
                this.settingService.get<SimpleAuthSettings>(
                    simpleAuthSettingsKey,
                ),
                this.maintenanceService.isMaintenanceMode(),
            ]);

        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type == IAuthType.NONE;

        const expFlags = this.config.flagResolver.getAll({
            email: req.user.email,
        });
        const flags = { ...this.config.ui.flags, ...expFlags };

        const response: UiConfigSchema = {
            ...this.config.ui,
            flags,
            version,
            emailEnabled: this.emailService.isEnabled(),
            unleashUrl: this.config.server.unleashUrl,
            baseUriPath: this.config.server.baseUriPath,
            authenticationType: this.config.authentication?.type,
            segmentValuesLimit: this.config.segmentValuesLimit,
            strategySegmentsLimit: this.config.strategySegmentsLimit,
            frontendApiOrigins: frontendSettings.frontendApiOrigins,
            versionInfo: this.versionService.getVersionInfo(),
            networkViewEnabled: this.config.prometheusApi !== undefined,
            disablePasswordAuth,
            maintenanceMode,
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
            await this.proxyService.setFrontendSettings(
                req.body.frontendSettings,
                extractUsername(req),
            );
            res.sendStatus(204);
            return;
        }

        throw new NotFoundError();
    }
}

export default ConfigController;
