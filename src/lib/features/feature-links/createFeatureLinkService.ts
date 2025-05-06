import type { IUnleashConfig } from '../../types';
import FeatureLinkService from './feature-link-service';
import FakeFeatureLinkStore from './fake-feature-link-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import type { Db } from '../../db/db';
import { FeatureLinkStore } from './feature-link-store';

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
