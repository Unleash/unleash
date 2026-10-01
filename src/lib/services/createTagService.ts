import type { Db } from '../db/db.js';
import type { IUnleashConfig, ITagStore } from '../types/index.js';
import type EventService from '../features/events/event-service.js';
import TagService from './tag-service.js';
import TagStore from '../db/tag-store.js';
import FakeTagStore from '../../test/fixtures/fake-tag-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../features/events/createEventsService.js';

export const createTagService =
    (config: IUnleashConfig) =>
    (db: Db): TagService => {
        const { getLogger, eventBus } = config;
        const tagStore = new TagStore(db, eventBus, getLogger);
        const eventService = createEventsService(db, config);
        return new TagService({ tagStore }, config, eventService);
    };

export const createFakeTagService = (
    config: IUnleashConfig,
    stores?: { tagStore?: ITagStore },
    eventService?: EventService,
): TagService => {
    const tagStore = stores?.tagStore || new FakeTagStore();
    return new TagService(
        { tagStore },
        config,
        eventService || createFakeEventsService(config),
    );
};
