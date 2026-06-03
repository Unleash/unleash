import type { IUnleashConfig } from '../../../types/index.js';
import type SettingService from '../../settings/setting-service.js';
import {
    EXTERNAL_SOURCE_SETTING_KEY,
    type ExternalImpactMetricsSource,
} from './external-impact-metrics-source.js';

export type ImpactMetricsAvailability =
    | 'disabled'
    | 'unconfigured'
    | 'external'
    | 'internal'
    | 'full';

export type ImpactMetricsAvailabilityConfig = Pick<
    IUnleashConfig,
    'isEnterprise' | 'prometheusImpactMetricsApi' | 'flagResolver'
>;

/**
 * Resolves the impact-metrics availability state surfaced in uiConfig.
 *
 * Edition and the internal-source presence come from config (static); the
 * killswitch flag and the configured external source are read on each
 * `resolve()` because they can change at runtime.
 */
export class ImpactMetricsAvailabilityResolver {
    private readonly config: ImpactMetricsAvailabilityConfig;
    private readonly settingService: Pick<SettingService, 'getWithDefault'>;

    constructor(
        config: ImpactMetricsAvailabilityConfig,
        settingService: Pick<SettingService, 'getWithDefault'>,
    ) {
        this.config = config;
        this.settingService = settingService;
    }

    async resolve(): Promise<ImpactMetricsAvailability> {
        if (
            !this.config.isEnterprise ||
            this.config.flagResolver.isEnabled('disableImpactMetrics')
        ) {
            return 'disabled';
        }

        const externalSource =
            await this.settingService.getWithDefault<ExternalImpactMetricsSource>(
                EXTERNAL_SOURCE_SETTING_KEY,
                { enabled: false },
            );
        const hasInternal =
            this.config.prometheusImpactMetricsApi !== undefined;
        const hasExternal = Boolean(
            externalSource.enabled && externalSource.url,
        );

        if (hasInternal && hasExternal) return 'full';
        if (hasInternal) return 'internal';
        if (hasExternal) return 'external';
        return 'unconfigured';
    }
}
