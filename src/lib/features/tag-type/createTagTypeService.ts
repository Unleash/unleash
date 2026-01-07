import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import TagTypeService from './tag-type-service.js';
import TagTypeStore from './tag-type-store.js';
import FakeTagTypeStore from './fake-tag-type-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

export const createTagTypeService =
    (config: IUnleashConfig) =>
    (db: Db): TagTypeService => {
        const { getLogger, eventBus } = config;
        const eventService = createEventsService(db, config);
        const tagTypeStore = new TagTypeStore(db, eventBus, getLogger);
        return new TagTypeService({ tagTypeStore }, config, eventService);
    };

export const createFakeTagTypeService = (
    config: IUnleashConfig,
): TagTypeService => {
    const eventService = createFakeEventsService(config);
    const tagTypeStore = new FakeTagTypeStore();

    return new TagTypeService({ tagTypeStore }, config, eventService);
};
