import ky from 'ky';
import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import version from '../util/version.js';
import type { Logger } from '../logger.js';
import type { ISettingStore } from '../types/stores/settings-store.js';
import type { EdgeInstanceUsage } from '../features/instance-stats/getEdgeInstances.js';

export interface IVersionInfo {
    oss: string;
    enterprise?: string;
}

export interface IVersionHolder {
    current: IVersionInfo;
    latest: Partial<IVersionInfo>;
    isLatest: boolean;
    instanceId: string;
    buildDate?: string;
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
    customRootRoles: number;
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
    activeUsers30: number;
    activeUsers60: number;
    activeUsers90: number;
    productionChanges30: number;
    productionChanges60: number;
    productionChanges90: number;
    postgresVersion: string;
    licenseType: string;
    hostedBy: string;
    releaseTemplates: number;
    releasePlans: number;
    edgeInstanceUsage?: EdgeInstanceUsage;
}

export type IInstanceInfo = Partial<{
    customerPlan: string;
    customerName: string;
    clientId: string;
}>;

export default class VersionService {
    private logger: Logger;

    private settingStore: ISettingStore;

    private current: IVersionInfo;

    private latest?: IVersionInfo;

    private enabled: boolean;

    private telemetryEnabled: boolean;

    private versionCheckUrl?: string;

    private instanceId?: string;

    private isLatest: boolean;

    private timer: NodeJS.Timeout;

    private readonly buildDate?: string;

    constructor(
        { settingStore }: Pick<IUnleashStores, 'settingStore'>,
        {
            getLogger,
            versionCheck,
            enterpriseVersion,
            telemetry,
            buildDate,
        }: Pick<
            IUnleashConfig,
            | 'getLogger'
            | 'versionCheck'
            | 'enterpriseVersion'
            | 'telemetry'
            | 'buildDate'
        >,
    ) {
        this.logger = getLogger('lib/services/version-service.js');
        this.settingStore = settingStore;
        this.current = {
            oss: version,
            enterprise: enterpriseVersion || '',
        };
        this.enabled = versionCheck.enable || false;
        this.telemetryEnabled = telemetry;
        this.versionCheckUrl = versionCheck.url;
        this.isLatest = true;
        this.buildDate = buildDate;
    }

    private async readInstanceId(): Promise<string | undefined> {
        try {
            const { id } = (await this.settingStore.get<{ id: string }>(
                'instanceInfo',
            )) ?? { id: undefined };
            return id;
        } catch (err) {
            this.logger.warn('Could not find instanceInfo', err);
        }
    }

    async getInstanceId() {
        if (!this.instanceId) {
            this.instanceId = await this.readInstanceId();
        }
        return this.instanceId;
    }

    async checkLatestVersion(
        telemetryDataProvider: () => Promise<IFeatureUsageInfo>,
        instanceInfoProvider?: () => Promise<IInstanceInfo | undefined>,
    ): Promise<void> {
        const instanceId = await this.getInstanceId();
        this.logger.debug(
            `Checking for newest version for instanceId=${instanceId}`,
        );
        if (this.enabled) {
            try {
                const versionPayload: any = {
                    versions: this.current,
                    instanceId: instanceId,
                };

                if (this.telemetryEnabled) {
                    versionPayload.featureInfo = await telemetryDataProvider();
                    const instanceInfo = await instanceInfoProvider?.();
                    if (instanceInfo) {
                        versionPayload.instanceInfo = instanceInfo;
                    }
                }
                if (this.versionCheckUrl) {
                    const res = await ky.post(this.versionCheckUrl, {
                        json: versionPayload,
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
                } else {
                    this.logger.info('Had no URL to check newest version');
                }
            } catch (err) {
                this.logger.info('Could not check newest version', err);
            }
        }
    }
    async getVersionInfo(): Promise<IVersionHolder> {
        const instanceId = await this.getInstanceId();
        return {
            current: this.current,
            latest: this.latest || {},
            isLatest: this.isLatest,
            instanceId: instanceId || 'unresolved-instance-id',
            buildDate: this.buildDate,
        };
    }
}
