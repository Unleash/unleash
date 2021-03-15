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
        this.setInstanceId();
        if (versionCheck && versionCheck.url) {
            this.versionCheckUrl = versionCheck.url;
            if (versionCheck.enable === 'true') {
                this.enabled = true;
                this.checkLatestVersion(this.instanceId);
                setInterval(
                    () => this.checkLatestVersion(this.instanceId),
                    TWO_DAYS,
                );
            } else {
                this.enabled = false;
            }
        }
    }

    async setInstanceId() {
        try {
            const { id } = await this.settingStore.get('instanceInfo');
            this.instanceId = id;
            return id;
        } catch (err) {
            this.logger.warn('Could not find instanceInfo');
            return undefined;
        }
    }

    async checkLatestVersion(instanceId) {
        if (this.enabled) {
            try {
                const data = await fetch(this.versionCheckUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        versions: this.current,
                        instanceId,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                }).then(res => res.json());
                this.latest = {
                    oss: data.versions.oss,
                    enterprise: data.versions.enterprise,
                };
                this.isLatest = data.latest;
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
