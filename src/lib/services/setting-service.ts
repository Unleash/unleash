import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { ISettingStore } from '../types/stores/settings-store';
import { IEventStore } from '../types/stores/event-store';
import {
    SettingCreatedEvent,
    SettingDeletedEvent,
    SettingUpdatedEvent,
} from '../types/events';
import { validateOrigins } from '../util/validateOrigin';
import {
    FrontendSettings,
    frontendSettingsKey,
} from '../types/settings/frontend-settings';
import BadDataError from '../error/bad-data-error';

export default class SettingService {
    private config: IUnleashConfig;

    private logger: Logger;

    private settingStore: ISettingStore;

    private eventStore: IEventStore;

    // SettingService.getFrontendSettings is called on every request to the
    // frontend API. Keep fetched settings in a cache for fewer DB queries.
    private cache = new Map<string, unknown>();

    constructor(
        {
            settingStore,
            eventStore,
        }: Pick<IUnleashStores, 'settingStore' | 'eventStore'>,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/setting-service.ts');
        this.settingStore = settingStore;
        this.eventStore = eventStore;
    }

    async get<T>(id: string, defaultValue?: T): Promise<T> {
        if (!this.cache.has(id)) {
            this.cache.set(id, await this.settingStore.get(id));
        }
        return (this.cache.get(id) as T) || defaultValue;
    }

    async insert(id: string, value: object, createdBy: string): Promise<void> {
        this.cache.delete(id);
        const exists = await this.settingStore.exists(id);
        if (exists) {
            await this.settingStore.updateRow(id, value);
            await this.eventStore.store(
                new SettingUpdatedEvent({
                    createdBy,
                    data: { id },
                }),
            );
        } else {
            await this.settingStore.insert(id, value);
            await this.eventStore.store(
                new SettingCreatedEvent({
                    createdBy,
                    data: { id },
                }),
            );
        }
    }

    async delete(id: string, createdBy: string): Promise<void> {
        this.cache.delete(id);
        await this.settingStore.delete(id);
        await this.eventStore.store(
            new SettingDeletedEvent({
                createdBy,
                data: {
                    id,
                },
            }),
        );
    }

    async deleteAll(): Promise<void> {
        this.cache.clear();
        await this.settingStore.deleteAll();
    }

    async setFrontendSettings(
        value: FrontendSettings,
        createdBy: string,
    ): Promise<void> {
        const error = validateOrigins(value.frontendApiOrigins);
        if (error) {
            throw new BadDataError(error);
        }
        await this.insert(frontendSettingsKey, value, createdBy);
    }

    async getFrontendSettings(): Promise<FrontendSettings> {
        return this.get(frontendSettingsKey, {
            frontendApiOrigins: this.config.frontendApiOrigins,
        });
    }
}

module.exports = SettingService;
