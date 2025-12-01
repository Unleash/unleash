import FeatureToggleClientStore from '../client-feature-flags/client-feature-toggle-store.js';
import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import FakeClientFeatureToggleStore from './fakes/fake-client-feature-toggle-store.js';
import { ClientFeatureToggleService } from './client-feature-toggle-service.js';
import { SegmentReadModel } from '../segment/segment-read-model.js';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model.js';
import { createClientFeatureToggleDelta } from './delta/createClientFeatureToggleDelta.js';

export const createClientFeatureToggleService = (
    db: Db,
    config: IUnleashConfig,
): ClientFeatureToggleService => {
    const featureToggleClientStore = new FeatureToggleClientStore(
        db,
        config.eventBus,
        config,
    );

    const segmentReadModel = new SegmentReadModel(db);

    const clientFeatureToggleCache = createClientFeatureToggleDelta(db, config);

    const clientFeatureToggleService = new ClientFeatureToggleService(
        {
            clientFeatureToggleStore: featureToggleClientStore,
        },
        segmentReadModel,
        clientFeatureToggleCache,
        config,
    );

    return clientFeatureToggleService;
};

export const createFakeClientFeatureToggleService = (
    config: IUnleashConfig,
): ClientFeatureToggleService => {
    const fakeClientFeatureToggleStore = new FakeClientFeatureToggleStore();

    const fakeSegmentReadModel = new FakeSegmentReadModel();

    const clientFeatureToggleService = new ClientFeatureToggleService(
        {
            clientFeatureToggleStore: fakeClientFeatureToggleStore,
        },
        fakeSegmentReadModel,
        null,
        config,
    );

    return clientFeatureToggleService;
};
