import fetch from 'node-fetch';

const TWO_DAYS = 48 * 60 * 60 * 1000;
class VersionService {
    constructor(
        { settingStore },
        { getLogger, versionCheck, version, enterpriseVersion },
    ) {
        this.logger = getLogger('lib/services/version-service.js');
        this.settingStore = settingStore;
        this.current = {
            oss: version,
            enterprise: enterpriseVersion,
        };
        this.enabled =
            versionCheck && versionCheck.enable === 'true' && versionCheck.url;
        this.versionCheckUrl = versionCheck ? versionCheck.url : undefined;
        process.nextTick(() => this.setup());
    }

    async setup() {
        await this.setInstanceId();
        await this.checkLatestVersion(this.instanceId);
        setInterval(
            async () => this.checkLatestVersion(this.instanceId),
            TWO_DAYS,
        );
    }

    async setInstanceId() {
        try {
            const { id } = await this.settingStore.get('instanceInfo');
            this.instanceId = id;
        } catch (err) {
            this.logger.warn('Could not find instanceInfo');
        }
    }

    async checkLatestVersion() {
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

    getVersionInfo() {
        return {
            current: this.current,
            latest: this.latest || {},
            isLatest: this.isLatest,
            instanceId: this.instanceId,
        };
    }
}

module.exports = VersionService;
