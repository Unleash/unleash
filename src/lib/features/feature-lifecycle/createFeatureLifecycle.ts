import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store';
import { FeatureLifecycleService } from './feature-lifecycle-service';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import type { IUnleashConfig } from '../../types';
import EventStore from '../../db/event-store';
import type { Db } from '../../db/db';
import { FeatureLifecycleStore } from './feature-lifecycle-store';
import EnvironmentStore from '../project-environments/environment-store';

export const createFeatureLifecycleService = (
    db: Db,
    config: IUnleashConfig,
) => {
    const { eventBus, getLogger, flagResolver } = config;
    const eventStore = new EventStore(db, getLogger);
    const featureLifecycleStore = new FeatureLifecycleStore(db);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const featureLifecycleService = new FeatureLifecycleService(
        {
            eventStore,
            featureLifecycleStore,
            environmentStore,
        },
        config,
    );

    return {
        featureLifecycleService,
        featureLifecycleStore,
        eventStore,
        environmentStore,
    };
};

export const createFakeFeatureLifecycleService = (config: IUnleashConfig) => {
    const eventStore = new FakeEventStore();
    const featureLifecycleStore = new FakeFeatureLifecycleStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureLifecycleService = new FeatureLifecycleService(
        {
            eventStore,
            featureLifecycleStore,
            environmentStore,
        },
        config,
    );

    return {
        featureLifecycleService,
        featureLifecycleStore,
        eventStore,
        environmentStore,
    };
};
