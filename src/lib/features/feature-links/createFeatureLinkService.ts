import type { IUnleashConfig } from '../../types/index.js';
import FeatureLinkService from './feature-link-service.js';
import FakeFeatureLinkStore from './fake-feature-link-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import type { Db } from '../../db/db.js';
import { FeatureLinkStore } from './feature-link-store.js';

export const createFeatureLinkService =
    (config: IUnleashConfig) => (db: Db) => {
        const eventService = createEventsService(db, config);
        const featureLinkStore = new FeatureLinkStore(db, config);

        return new FeatureLinkService(
            { featureLinkStore },
            config,
            eventService,
        );
    };

export const createFakeFeatureLinkService = (config: IUnleashConfig) => {
    const eventService = createFakeEventsService(config);
    const featureLinkStore = new FakeFeatureLinkStore();

    const featureLinkService = new FeatureLinkService(
        { featureLinkStore },
        config,
        eventService,
    );

    return { featureLinkService, featureLinkStore };
};
