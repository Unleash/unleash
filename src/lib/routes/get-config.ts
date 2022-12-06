// @ts-ignore
// @ts-ignore

import { Response } from 'express';
import {
    AuthedRequest,
    IAuthType,
    IUnleashConfig,
    IUnleashServices,
    NONE,
} from '../types';
import version from '../util/version';
import Controller from './controller';
import VersionService from './../services/version-service';
import SettingService from './../services/setting-service';
import {
    SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../types/settings/simple-auth-settings';
import {
    createResponseSchema,
    UiConfigSchema,
    uiConfigSchema,
} from '../openapi';
import { EmailService, OpenApiService } from '../services';

class GetConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private emailService: EmailService;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            emailService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'versionService'
            | 'settingService'
            | 'emailService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.openApiService = openApiService;

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
    }

    async getUiConfig(
        req: AuthedRequest,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
        const [frontendSettings, simpleAuthSettings] = await Promise.all([
            this.settingService.getFrontendSettings(),
            this.settingService.get<SimpleAuthSettings>(simpleAuthSettingsKey),
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
            disablePasswordAuth,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            uiConfigSchema.$id,
            response,
        );
    }
}

export default GetConfigController;
