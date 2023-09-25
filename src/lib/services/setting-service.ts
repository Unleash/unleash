import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { ISettingStore } from '../types/stores/settings-store';
import {
    SettingCreatedEvent,
    SettingDeletedEvent,
    SettingUpdatedEvent,
} from '../types/events';
import EventService from './event-service';

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

    async get<T>(id: string, defaultValue?: T): Promise<T> {
        const value = await this.settingStore.get(id);
        return value || defaultValue;
    }

    async insert(id: string, value: object, createdBy: string): Promise<void> {
        const exists = await this.settingStore.exists(id);
        if (exists) {
            await this.settingStore.updateRow(id, value);
            await this.eventService.storeEvent(
                new SettingUpdatedEvent({
                    createdBy,
                    data: { id },
                }),
            );
        } else {
            await this.settingStore.insert(id, value);
            await this.eventService.storeEvent(
                new SettingCreatedEvent({
                    createdBy,
                    data: { id },
                }),
            );
        }
    }

    async delete(id: string, createdBy: string): Promise<void> {
        await this.settingStore.delete(id);
        await this.eventService.storeEvent(
            new SettingDeletedEvent({
                createdBy,
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
