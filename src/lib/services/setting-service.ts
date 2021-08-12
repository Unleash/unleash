import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { ISettingStore } from '../types/stores/settings-store';

export default class SettingService {
    private logger: Logger;

    private settingStore: ISettingStore;

    constructor(
        { settingStore }: Pick<IUnleashStores, 'settingStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/setting-service.ts');
        this.settingStore = settingStore;
    }

    async get(id: string): Promise<object> {
        return this.settingStore.get(id);
    }

    async insert(id: string, value: object): Promise<void> {
        return this.settingStore.insert(id, value);
    }

    async delete(id: string): Promise<void> {
        return this.settingStore.delete(id);
    }
}

module.exports = SettingService;
