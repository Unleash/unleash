import type { Db } from '../db/db.js';
import type { IUnleashConfig } from '../types/index.js';
import FeatureTagService from './feature-tag-service.js';
import FeatureToggleStore from '../features/feature-toggle/feature-toggle-store.js';
import TagStore from '../db/tag-store.js';
import FeatureTagStore from '../db/feature-tag-store.js';
import { createEventsService } from '../features/events/createEventsService.js';

export const createFeatureTagService =
    (config: IUnleashConfig) =>
    (db: Db): FeatureTagService => {
        const { eventBus, getLogger, flagResolver } = config;
        const tagStore = new TagStore(db, eventBus, getLogger);
        const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
        const featureToggleStore = new FeatureToggleStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );
        const eventService = createEventsService(db, config);
        return new FeatureTagService(
            { tagStore, featureTagStore, featureToggleStore },
            config,
            eventService,
        );
    };
