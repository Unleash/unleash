import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import PatStore from './pat-store.js';
import PatService from './pat-service.js';
import FakePatStore from './fake-pat-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

export const createPatService = (
    db: Db,
    config: IUnleashConfig,
): PatService => {
    const patStore = new PatStore(db, config.getLogger);
    const eventService = createEventsService(db, config);
    return new PatService({ patStore }, config, eventService);
};

export const createFakePatService = (config: IUnleashConfig): PatService => {
    const patStore = new FakePatStore();
    const eventService = createFakeEventsService(config);
    return new PatService({ patStore }, config, eventService);
};
