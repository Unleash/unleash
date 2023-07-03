import fetch from 'make-fetch-happen';
import {
    IContextFieldStore,
    IEnvironmentStore,
    IEventStore,
    IFeatureStrategiesStore,
    IFeatureToggleStore,
    IGroupStore,
    IProjectStore,
    IRoleStore,
    ISegmentStore,
    IUnleashStores,
    IUserStore,
} from '../types/stores';
import { IUnleashConfig } from '../types/option';
import version from '../util/version';
import { Logger } from '../logger';
import { ISettingStore } from '../types/stores/settings-store';
import { hoursToMilliseconds } from 'date-fns';
import { IStrategyStore } from 'lib/types';
import { FEATURES_EXPORTED, FEATURES_IMPORTED } from '../types';

export interface IVersionInfo {
    oss: string;
    enterprise?: string;
}

export interface IVersionHolder {
    current: IVersionInfo;
    latest: Partial<IVersionInfo>;
    isLatest: boolean;
    instanceId: string;
}

export interface IVersionResponse {
    versions: IVersionInfo;
    latest: boolean;
}

export interface IFeatureUsageInfo {
    instanceId: string;
    versionOSS: string;
    versionEnterprise?: string;
    users: number;
    featureToggles: number;
    projects: number;
    contextFields: number;
    roles: number;
    featureExports: number;
    featureImports: number;
    groups: number;
    environments: number;
    segments: number;
    strategies: number;
    SAMLenabled: boolean;
    OIDCenabled: boolean;
    customStrategies: number;
    customStrategiesInUse: number;
}

export default class VersionService {
    private logger: Logger;

    private settingStore: ISettingStore;

    private strategyStore: IStrategyStore;

    private userStore: IUserStore;

    private featureToggleStore: IFeatureToggleStore;

    private projectStore: IProjectStore;

    private environmentStore: IEnvironmentStore;

    private contextFieldStore: IContextFieldStore;

    private groupStore: IGroupStore;

    private roleStore: IRoleStore;

    private segmentStore: ISegmentStore;

    private eventStore: IEventStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private current: IVersionInfo;

    private latest?: IVersionInfo;

    private enabled: boolean;

    private telemetryEnabled: boolean;

    private versionCheckUrl: string;

    private instanceId?: string;

    private isLatest: boolean;

    private timer: NodeJS.Timeout;

    constructor(
        {
            settingStore,
            strategyStore,
            userStore,
            featureToggleStore,
            projectStore,
            environmentStore,
            contextFieldStore,
            groupStore,
            roleStore,
            segmentStore,
            eventStore,
            featureStrategiesStore,
        }: Pick<
            IUnleashStores,
            | 'settingStore'
            | 'strategyStore'
            | 'userStore'
            | 'featureToggleStore'
            | 'projectStore'
            | 'environmentStore'
            | 'contextFieldStore'
            | 'groupStore'
            | 'roleStore'
            | 'segmentStore'
            | 'eventStore'
            | 'featureStrategiesStore'
        >,
        {
            getLogger,
            versionCheck,
            enterpriseVersion,
            telemetry,
        }: Pick<
            IUnleashConfig,
            'getLogger' | 'versionCheck' | 'enterpriseVersion' | 'telemetry'
        >,
    ) {
        this.logger = getLogger('lib/services/version-service.js');
        this.settingStore = settingStore;
        this.strategyStore = strategyStore;
        this.userStore = userStore;
        this.featureToggleStore = featureToggleStore;
        this.projectStore = projectStore;
        this.environmentStore = environmentStore;
        this.contextFieldStore = contextFieldStore;
        this.groupStore = groupStore;
        this.roleStore = roleStore;
        this.segmentStore = segmentStore;
        this.eventStore = eventStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.current = {
            oss: version,
            enterprise: enterpriseVersion || '',
        };
        this.enabled = versionCheck.enable;
        this.telemetryEnabled = telemetry;
        this.versionCheckUrl = versionCheck.url;
        this.isLatest = true;
        process.nextTick(() => this.setup());
    }

    async setup(): Promise<void> {
        await this.setInstanceId();
        await this.checkLatestVersion();
        this.timer = setInterval(
            async () => this.checkLatestVersion(),
            hoursToMilliseconds(48),
        );
        this.timer.unref();
    }

    async setInstanceId(): Promise<void> {
        try {
            const { id } = await this.settingStore.get('instanceInfo');
            this.instanceId = id;
        } catch (err) {
            this.logger.warn('Could not find instanceInfo');
        }
    }

    async checkLatestVersion(): Promise<void> {
        if (this.enabled) {
            try {
                const versionPayload: any = {
                    versions: this.current,
                    instanceId: this.instanceId,
                };

                if (this.telemetryEnabled) {
                    const featureInfo = await this.getFeatureUsageInfo();
                    versionPayload.featureInfo = featureInfo;
                }
                const res = await fetch(this.versionCheckUrl, {
                    method: 'POST',
                    body: JSON.stringify(versionPayload),
                    headers: { 'Content-Type': 'application/json' },
                });
                if (res.ok) {
                    const data = (await res.json()) as IVersionResponse;
                    this.latest = {
                        oss: data.versions.oss,
                        enterprise: data.versions.enterprise,
                    };
                    this.isLatest = data.latest;
                } else {
                    this.logger.info(
                        `Could not check newest version. Status: ${res.status}`,
                    );
                }
            } catch (err) {
                this.logger.info('Could not check newest version', err);
            }
        }
    }

    async getFeatureUsageInfo(): Promise<IFeatureUsageInfo> {
        const [
            featureToggles,
            users,
            projects,
            contextFields,
            groups,
            roles,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
            featureExports,
            featureImports,
        ] = await Promise.all([
            this.featureToggleStore.count({
                archived: false,
            }),
            this.userStore.count(),
            this.projectStore.count(),
            this.contextFieldStore.count(),
            this.groupStore.count(),
            this.roleStore.count(),
            this.environmentStore.count(),
            this.segmentStore.count(),
            this.strategyStore.count(),
            this.hasSAML(),
            this.hasOIDC(),
            this.eventStore.filteredCount({ type: FEATURES_EXPORTED }),
            this.eventStore.filteredCount({ type: FEATURES_IMPORTED }),
        ]);
        const versionInfo = this.getVersionInfo();
        const customStrategies =
            await this.strategyStore.getEditableStrategies();
        const customStrategiesInUse =
            await this.featureStrategiesStore.getCustomStrategiesInUseCount();
        const featureInfo = {
            featureToggles,
            users,
            projects,
            contextFields,
            groups,
            roles,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
            featureExports,
            featureImports,
            customStrategies: customStrategies.length,
            customStrategiesInUse: customStrategiesInUse,
            instanceId: versionInfo.instanceId,
            versionOSS: versionInfo.current.oss,
            versionEnterprise: versionInfo.current.enterprise,
        };
        return featureInfo;
    }

    async hasOIDC(): Promise<boolean> {
        const settings = await this.settingStore.get(
            'unleash.enterprise.auth.oidc',
        );

        return settings?.enabled || false;
    }

    async hasSAML(): Promise<boolean> {
        const settings = await this.settingStore.get(
            'unleash.enterprise.auth.saml',
        );

        return settings?.enabled || false;
    }

    getVersionInfo(): IVersionHolder {
        return {
            current: this.current,
            latest: this.latest || {},
            isLatest: this.isLatest,
            instanceId: this.instanceId,
        };
    }

    destroy(): void {
        clearInterval(this.timer);
        this.timer = null;
    }
}

module.exports = VersionService;
