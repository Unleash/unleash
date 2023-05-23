import fetch from 'make-fetch-happen';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import version from '../util/version';
import { Logger } from '../logger';
import { ISettingStore } from '../types/stores/settings-store';
import { hoursToMilliseconds } from 'date-fns';
import { IUnleashServices } from 'lib/types';
import { InstanceStatsService, InstanceStats } from './instance-stats-service';
import StrategyStore from 'lib/db/strategy-store';

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

export interface IFeatureUsageInfo extends InstanceStats {
    customStrategies: number;
    customStrategiesInUse: number;
}

export default class VersionService {
    private logger: Logger;

    private settingStore: ISettingStore;

    private instanceStatsService: InstanceStatsService;

    private strategyStore: StrategyStore;

    private current: IVersionInfo;

    private latest?: IVersionInfo;

    private enabled: boolean;

    private versionCheckUrl: string;

    private instanceId?: string;

    private isLatest: boolean;

    private timer: NodeJS.Timeout;

    constructor(
        { settingStore }: Pick<IUnleashStores, 'settingStore'>,
        { strategyStore }: Pick<IUnleashStores, 'strategyStore'>,
        {
            getLogger,
            versionCheck,
            enterpriseVersion,
        }: Pick<
            IUnleashConfig,
            'getLogger' | 'versionCheck' | 'enterpriseVersion'
        >,
        {
            instanceStatsService,
        }: Pick<IUnleashServices, 'instanceStatsService'>,
    ) {
        this.logger = getLogger('lib/services/version-service.js');
        this.settingStore = settingStore;
        this.instanceStatsService = instanceStatsService;
        this.strategyStore = strategyStore;
        this.current = {
            oss: version,
            enterprise: enterpriseVersion || '',
        };
        this.enabled = versionCheck.enable;
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
                const instanceStats =
                    await this.instanceStatsService.getStats();
                const customStrategies =
                    await this.strategyStore.getEditableStrategies();
                const featureInfo = {
                    ...instanceStats,
                    customStrategies: customStrategies.length,
                };
                const res = await fetch(this.versionCheckUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        versions: this.current,
                        instanceId: this.instanceId,
                        featureInfo,
                    }),
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
