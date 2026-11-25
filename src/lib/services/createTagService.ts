import type { Db } from '../db/db.js';
import type {
    IUnleashConfig,
    ITagStore,
    ITagTypeStore,
} from '../types/index.js';
import type EventService from '../features/events/event-service.js';
import TagService from './tag-service.js';
import TagStore from '../db/tag-store.js';
import FakeTagStore from '../../test/fixtures/fake-tag-store.js';
import TagTypeStore from '../features/tag-type/tag-type-store.js';
import FakeTagTypeStore from '../features/tag-type/fake-tag-type-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../features/events/createEventsService.js';

export const createTagService =
    (config: IUnleashConfig) =>
    (db: Db): TagService => {
        const { getLogger, eventBus } = config;
        const tagStore = new TagStore(db, eventBus, getLogger);
        const tagTypeStore = new TagTypeStore(db, eventBus, getLogger);
        const eventService = createEventsService(db, config);
        return new TagService({ tagStore, tagTypeStore }, config, eventService);
    };

export const createFakeTagService = (
    config: IUnleashConfig,
    stores?: { tagStore?: ITagStore; tagTypeStore?: ITagTypeStore },
    eventService?: EventService,
): TagService => {
    const tagStore = stores?.tagStore || new FakeTagStore();
    const tagTypeStore = stores?.tagTypeStore || new FakeTagTypeStore();
    return new TagService(
        { tagStore, tagTypeStore },
        config,
        eventService || createFakeEventsService(config),
    );
};
