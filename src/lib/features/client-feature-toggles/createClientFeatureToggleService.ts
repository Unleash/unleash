import FeatureToggleClientStore from '../client-feature-toggles/client-feature-toggle-store';
import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import FakeClientFeatureToggleStore from './fakes/fake-client-feature-toggle-store';
import { ClientFeatureToggleService } from './client-feature-toggle-service';
import { SegmentReadModel } from '../segment/segment-read-model';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model';

export const createClientFeatureToggleService = (
    db: Db,
    config: IUnleashConfig,
): ClientFeatureToggleService => {
    const { getLogger, eventBus, flagResolver } = config;

    const featureToggleClientStore = new FeatureToggleClientStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const segmentReadModel = new SegmentReadModel(db);

    const clientFeatureToggleService = new ClientFeatureToggleService(
        {
            clientFeatureToggleStore: featureToggleClientStore,
        },
        segmentReadModel,
        { getLogger, flagResolver },
    );

    return clientFeatureToggleService;
};

export const createFakeClientFeatureToggleService = (
    config: IUnleashConfig,
): ClientFeatureToggleService => {
    const { getLogger, flagResolver } = config;

    const fakeClientFeatureToggleStore = new FakeClientFeatureToggleStore();

    const fakeSegmentReadModel = new FakeSegmentReadModel();

    const clientFeatureToggleService = new ClientFeatureToggleService(
        {
            clientFeatureToggleStore: fakeClientFeatureToggleStore,
        },
        fakeSegmentReadModel,
        { getLogger, flagResolver },
    );

    return clientFeatureToggleService;
};
