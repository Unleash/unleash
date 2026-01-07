import type { IUnleashConfig } from '../types/option.js';
import type { UiConfigSchema } from '../openapi/index.js';
import {
    IAuthType,
    type EmailService,
    type FrontendApiService,
    type IFlagResolver,
    type IUnleashServices,
    type SessionService,
    type SettingService,
    type User,
    type VersionService,
} from '../server-impl.js';
import type MaintenanceService from '../features/maintenance/maintenance-service.js';
import {
    type SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../types/settings/simple-auth-settings.js';
import version from '../util/version.js';
import type { ResourceLimitsService } from '../features/resource-limits/resource-limits-service.js';

export class UiConfigService {
    private config: IUnleashConfig;

    private versionService: VersionService;

    private settingService: SettingService;

    private frontendApiService: FrontendApiService;

    private emailService: EmailService;

    private sessionService: SessionService;

    private maintenanceService: MaintenanceService;

    private resourceLimitsService: ResourceLimitsService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            emailService,
            frontendApiService,
            maintenanceService,
            sessionService,
            resourceLimitsService,
        }: Pick<
            IUnleashServices,
            | 'versionService'
            | 'settingService'
            | 'emailService'
            | 'frontendApiService'
            | 'maintenanceService'
            | 'sessionService'
            | 'resourceLimitsService'
        >,
    ) {
        this.config = config;
        this.flagResolver = config.flagResolver;
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.frontendApiService = frontendApiService;
        this.maintenanceService = maintenanceService;
        this.sessionService = sessionService;
        this.resourceLimitsService = resourceLimitsService;
    }

    async getMaxSessionsCount(): Promise<number> {
        if (this.flagResolver.isEnabled('showUserDeviceCount')) {
            return this.sessionService.getMaxSessionsCount();
        }
        return 0;
    }

    async getUiConfig(user: User): Promise<UiConfigSchema> {
        const [
            frontendSettings,
            simpleAuthSettings,
            maintenanceMode,
            maxSessionsCount,
        ] = await Promise.all([
            this.frontendApiService.getFrontendSettings(false),
            this.settingService.get<SimpleAuthSettings>(simpleAuthSettingsKey),
            this.maintenanceService.isMaintenanceMode(),
            this.getMaxSessionsCount(),
        ]);

        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type === IAuthType.NONE;

        const expFlags = this.config.flagResolver.getAll({
            email: user.email,
        });

        const flags = {
            ...this.config.ui.flags,
            ...expFlags,
        };

        const unleashContext = {
            ...this.flagResolver.getStaticContext(),
            email: user.email,
            userId: user.id,
        };
        const uiConfig: UiConfigSchema = {
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
            resourceLimits:
                await this.resourceLimitsService.getResourceLimits(),
            disablePasswordAuth,
            maintenanceMode,
            feedbackUriPath: this.config.feedbackUriPath,
            maxSessionsCount,
            unleashContext: unleashContext,
        };

        return uiConfig;
    }
}
