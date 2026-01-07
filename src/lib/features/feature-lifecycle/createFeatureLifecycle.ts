import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store.js';
import { FeatureLifecycleService } from './feature-lifecycle-service.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import type { IUnleashConfig } from '../../types/index.js';
import { EventStore } from '../../db/event-store.js';
import type { Db } from '../../db/db.js';
import { FeatureLifecycleStore } from './feature-lifecycle-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store.js';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

export const createFeatureLifecycleService =
    (config: IUnleashConfig) => (db: Db) => {
        const { eventBus, getLogger } = config;
        const eventStore = new EventStore(db, getLogger);
        const featureLifecycleStore = new FeatureLifecycleStore(db, eventBus);
        const environmentStore = new EnvironmentStore(db, eventBus, config);
        const featureEnvironmentStore = new FeatureEnvironmentStore(
            db,
            eventBus,
            config,
        );
        const eventService = createEventsService(db, config);
        const featureLifecycleService = new FeatureLifecycleService(
            {
                eventStore,
                featureLifecycleStore,
                environmentStore,
                featureEnvironmentStore,
            },
            {
                eventService,
            },
            config,
        );

        return featureLifecycleService;
    };

export const createFakeFeatureLifecycleService = (config: IUnleashConfig) => {
    const eventStore = new FakeEventStore();
    const featureLifecycleStore = new FakeFeatureLifecycleStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const eventService = createFakeEventsService(config);
    const featureLifecycleService = new FeatureLifecycleService(
        {
            eventStore,
            featureLifecycleStore,
            environmentStore,
            featureEnvironmentStore,
        },
        {
            eventService,
        },
        config,
    );

    return {
        featureLifecycleService,
        featureLifecycleStore,
        eventStore,
        environmentStore,
        featureEnvironmentStore,
    };
};
