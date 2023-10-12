import FeatureToggleClientStore from '../client-feature-toggles/client-feature-toggle-store';
import { Db } from '../../db/db';
import { IUnleashConfig } from '../../types';
import FakeClientFeatureToggleStore from './fakes/fake-client-feature-toggle-store';
import { ClientFeatureToggleService } from './client-feature-toggle-service';

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

    const clientFeatureToggleService = new ClientFeatureToggleService(
        {
            clientFeatureToggleStore: featureToggleClientStore,
        },
        { getLogger, flagResolver },
    );

    return clientFeatureToggleService;
};

export const createFakeClientFeatureToggleService = (
    config: IUnleashConfig,
): ClientFeatureToggleService => {
    const { getLogger, flagResolver } = config;

    const fakeClientFeatureToggleStore = new FakeClientFeatureToggleStore();

    const clientFeatureToggleService = new ClientFeatureToggleService(
        {
            clientFeatureToggleStore: fakeClientFeatureToggleStore,
        },
        { getLogger, flagResolver },
    );

    return clientFeatureToggleService;
};
