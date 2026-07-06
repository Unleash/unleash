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
    type VersionService,
} from '../server-impl.js';
import type { IUser } from '../types/user.js';
import type MaintenanceService from '../features/maintenance/maintenance-service.js';
import {
    type SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../types/settings/simple-auth-settings.js';
import version from '../util/version.js';
import type { ResourceLimitsService } from '../features/resource-limits/resource-limits-service.js';
import { ImpactMetricsAvailabilityResolver } from '../features/metrics/impact/impact-metrics-availability.js';
import { hashValue } from '../util/anonymise.js';

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

    private impactMetricsAvailabilityResolver: ImpactMetricsAvailabilityResolver;

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
        this.impactMetricsAvailabilityResolver =
            new ImpactMetricsAvailabilityResolver(config, settingService);
    }

    async getMaxSessionsCount(): Promise<number> {
        if (this.flagResolver.isEnabled('showUserDeviceCount')) {
            return this.sessionService.getMaxSessionsCount();
        }
        return 0;
    }

    async getUiConfig(
        user: Pick<IUser, 'id' | 'email'>,
        sessionId?: string,
    ): Promise<UiConfigSchema> {
        const [
            frontendSettings,
            simpleAuthSettings,
            maintenanceMode,
            maxSessionsCount,
            impactMetrics,
        ] = await Promise.all([
            this.frontendApiService.getFrontendSettings(false),
            this.settingService.get<SimpleAuthSettings>(simpleAuthSettingsKey),
            this.maintenanceService.isMaintenanceMode(),
            this.getMaxSessionsCount(),
            this.impactMetricsAvailabilityResolver.resolve(),
        ]);

        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type === IAuthType.NONE;

        const hashedEmail = user.email ? hashValue(user.email) : undefined;

        // Hash the raw sessionID (a credential) before exposing it; safe
        // unsalted because the sessionID is high-entropy.
        const analyticsSessionId = sessionId ? hashValue(sessionId) : undefined;

        const expFlags = this.config.flagResolver.getAll({
            email: hashedEmail,
            ...(analyticsSessionId ? { sessionId: analyticsSessionId } : {}),
        });

        const flags = {
            ...this.config.ui.flags,
            ...expFlags,
        };

        const unleashContext = {
            ...this.flagResolver.getStaticContext(),
            ...(hashedEmail ? { email: hashedEmail } : {}),
            userId: user.id,
            ...(analyticsSessionId ? { sessionId: analyticsSessionId } : {}),
        };
        const uiConfig: UiConfigSchema = {
            ...this.config.ui,
            flags,
            version,
            emailEnabled: this.emailService.isEnabled(),
            edgeUrl: this.config.server.edgeUrl,
            unleashUrl: this.config.server.unleashUrl,
            logRocketAppId: this.config.server.logRocketAppId,
            baseUriPath: this.config.server.baseUriPath,
            authenticationType: this.config.authentication?.type,
            frontendApiOrigins: frontendSettings.frontendApiOrigins,
            versionInfo: await this.versionService.getVersionInfo(),
            prometheusAPIAvailable: this.config.prometheusApi !== undefined,
            impactMetrics,
            resourceLimits:
                await this.resourceLimitsService.getResourceLimits(),
            disablePasswordAuth,
            maintenanceMode,
            feedbackUriPath: this.config.feedbackUriPath,
            maxSessionsCount,
            unleashContext: unleashContext,
            storiesPageEnabled: this.config.server.enableStoriesPage,
        };

        return uiConfig;
    }
}
