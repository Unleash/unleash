import fetch from 'node-fetch';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import version from '../util/version';
import { Logger } from '../logger';
import SettingStore from '../db/setting-store';

const TWO_DAYS = 48 * 60 * 60 * 1000;

export interface IVersionInfo {
    oss: string;
    enterprise?: string;
}

export interface IVersionHolder {
    current: VersionInfo;
    latest: VersionInfo | {};
    isLatest: boolean;
    instanceId: string;
}

export default class VersionService {
    private logger: Logger;

    private settingStore: SettingStore;

    private current: VersionInfo;

    private latest?: VersionInfo;

    private enabled: boolean;

    private versionCheckUrl: string;

    private instanceId?: string;

    private isLatest: boolean;

    constructor(
        { settingStore }: Pick<IUnleashStores, 'settingStore'>,
        {
            getLogger,
            versionCheck,
        }: Pick<IUnleashConfig, 'getLogger' | 'versionCheck'>,
        enterpriseVersion?: string,
    ) {
        this.logger = getLogger('lib/services/version-service.js');
        this.settingStore = settingStore;
        this.current = {
            oss: version,
            enterprise: enterpriseVersion,
        };
        this.enabled = versionCheck.enable;
        this.versionCheckUrl = versionCheck.url;
        this.isLatest = true;
        process.nextTick(() => this.setup());
    }

    async setup(): Promise<void> {
        await this.setInstanceId();
        await this.checkLatestVersion();
        setInterval(async () => this.checkLatestVersion(), TWO_DAYS);
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
                const res = await fetch(this.versionCheckUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        versions: this.current,
                        instanceId: this.instanceId,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
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

    getVersionInfo(): VersionHolder {
        return {
            current: this.current,
            latest: this.latest || {},
            isLatest: this.isLatest,
            instanceId: this.instanceId,
        };
    }
}

module.exports = VersionService;
