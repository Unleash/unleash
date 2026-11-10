import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import TagTypeService from './tag-type-service.js';
import TagTypeStore from './tag-type-store.js';
import FakeTagTypeStore from './fake-tag-type-store.js';
import { TagUsageReadModel } from '../tag-usage/tag-usage-read-model.js';
import { FakeTagUsageReadModel } from '../tag-usage/fake-tag-usage-read-model.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker.js';
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
        const tagUsageReadModel = new TagUsageReadModel(db);
        const privateProjectChecker = createPrivateProjectChecker(db, config);
        return new TagTypeService(
            { tagTypeStore },
            config,
            eventService,
            tagUsageReadModel,
            privateProjectChecker,
        );
    };

export const createFakeTagTypeService = (
    config: IUnleashConfig,
): TagTypeService => {
    const eventService = createFakeEventsService(config);
    const tagTypeStore = new FakeTagTypeStore();
    const tagUsageReadModel = new FakeTagUsageReadModel();
    const privateProjectChecker = createFakePrivateProjectChecker();

    return new TagTypeService(
        { tagTypeStore },
        config,
        eventService,
        tagUsageReadModel,
        privateProjectChecker,
    );
};
