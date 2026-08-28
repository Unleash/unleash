import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import SettingService from './setting-service.js';
import SettingStore from './setting-store.js';
import FakeSettingStore from './fake-setting-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

export const createSettingService =
    (config: IUnleashConfig) =>
    (db: Db): SettingService => {
        const settingStore = new SettingStore(db, config.getLogger);
        const eventService = createEventsService(db, config);
        return new SettingService({ settingStore }, config, eventService);
    };

export const createFakeSettingService = (
    config: IUnleashConfig,
): SettingService => {
    const settingStore = new FakeSettingStore();
    const eventService = createFakeEventsService(config);
    return new SettingService({ settingStore }, config, eventService);
};
