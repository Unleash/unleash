import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type { Logger } from '../logger';
import type { ISettingStore } from '../types/stores/settings-store';
import {
    SettingCreatedEvent,
    SettingDeletedEvent,
    SettingUpdatedEvent,
} from '../types/events';
import type EventService from '../features/events/event-service';
import type { IAuditUser } from '../types';

export default class SettingService {
    private config: IUnleashConfig;

    private logger: Logger;

    private settingStore: ISettingStore;

    private eventService: EventService;

    constructor(
        { settingStore }: Pick<IUnleashStores, 'settingStore'>,
        config: IUnleashConfig,
        eventService: EventService,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/setting-service.ts');
        this.settingStore = settingStore;
        this.eventService = eventService;
    }

    /**
     * @deprecated use getWithDefault instead
     */
    async get<T>(id: string, defaultValue?: T): Promise<T | undefined> {
        const value = await this.settingStore.get<T>(id);
        return value || defaultValue;
    }

    async getWithDefault<T>(id: string, defaultValue: T): Promise<T> {
        const value = await this.settingStore.get<T>(id);
        return value || defaultValue;
    }

    async insert(
        id: string,
        value: object,
        auditUser: IAuditUser,
        hideEventDetails: boolean = true,
    ): Promise<void> {
        const existingSettings = await this.settingStore.get<object>(id);

        let data: object = { id, ...value };
        let preData = existingSettings;

        if (hideEventDetails) {
            preData = { hideEventDetails: true };
            data = { id, hideEventDetails: true };
        }

        if (existingSettings) {
            await this.settingStore.updateRow(id, value);
            await this.eventService.storeEvent(
                new SettingUpdatedEvent(
                    {
                        data,
                        auditUser,
                    },
                    preData,
                ),
            );
        } else {
            await this.settingStore.insert(id, value);
            await this.eventService.storeEvent(
                new SettingCreatedEvent({
                    auditUser,
                    data,
                }),
            );
        }
    }

    async delete(id: string, auditUser: IAuditUser): Promise<void> {
        await this.settingStore.delete(id);
        await this.eventService.storeEvent(
            new SettingDeletedEvent({
                auditUser,
                data: {
                    id,
                },
            }),
        );
    }

    async deleteAll(): Promise<void> {
        await this.settingStore.deleteAll();
    }
}
