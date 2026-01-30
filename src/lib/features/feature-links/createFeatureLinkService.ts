import type { IUnleashConfig } from '../../types/index.js';
import FeatureLinkService from './feature-link-service.js';
import FakeFeatureLinkStore from './fake-feature-link-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import type { Db } from '../../db/db.js';
import { FeatureLinkStore } from './feature-link-store.js';
import { FeaturesReadModel } from '../feature-toggle/features-read-model.js';
import { FakeFeaturesReadModel } from '../feature-toggle/fakes/fake-features-read-model.js';
import type { IFeaturesReadModel } from '../feature-toggle/types/features-read-model-type.js';

export const createFeatureLinkService =
    (config: IUnleashConfig) => (db: Db) => {
        const eventService = createEventsService(db, config);
        const featureLinkStore = new FeatureLinkStore(db, config);
        const featuresReadModel = new FeaturesReadModel(db);

        return new FeatureLinkService(
            { featureLinkStore, featuresReadModel },
            config,
            eventService,
        );
    };

export const createFakeFeatureLinkService = (
    config: IUnleashConfig,
    overrides?: {
        featuresReadModel?: IFeaturesReadModel;
    },
) => {
    const eventService = createFakeEventsService(config);
    const featureLinkStore = new FakeFeatureLinkStore();
    const featuresReadModel =
        overrides?.featuresReadModel ?? new FakeFeaturesReadModel();

    const featureLinkService = new FeatureLinkService(
        { featureLinkStore, featuresReadModel },
        config,
        eventService,
    );

    return { featureLinkService, featureLinkStore };
};
