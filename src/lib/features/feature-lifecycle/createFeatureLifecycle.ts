import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store';
import { FeatureLifecycleService } from './feature-lifecycle-service';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import type { IUnleashConfig } from '../../types';
import EventStore from '../../db/event-store';
import type { Db } from '../../db/db';
import { FeatureLifecycleStore } from './feature-lifecycle-store';
import EnvironmentStore from '../project-environments/environment-store';
import EventService from '../events/event-service';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import FeatureTagStore from '../../db/feature-tag-store';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import EventEmitter from 'events';

export const createFeatureLifecycleService = (
    db: Db,
    config: IUnleashConfig,
) => {
    const { eventBus, getLogger, flagResolver } = config;
    const eventStore = new EventStore(db, getLogger);
    const featureLifecycleStore = new FeatureLifecycleStore(db);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const featureEnvironmentStore = new FeatureEnvironmentStore(
        db,
        eventBus,
        getLogger,
    );
    const featureTagStore = new FeatureTagStore(
        db,
        config.eventBus,
        config.getLogger,
    );
    const eventService = new EventService(
        { eventStore, featureTagStore },
        { getLogger, eventBus: new EventEmitter() },
    );
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
    };
};

export const createFakeFeatureLifecycleService = (config: IUnleashConfig) => {
    const eventStore = new FakeEventStore();
    const featureLifecycleStore = new FakeFeatureLifecycleStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
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
