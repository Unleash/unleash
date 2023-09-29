import { Db } from '../../db/db';
import { DependentFeaturesService } from './dependent-features-service';
import { DependentFeaturesStore } from './dependent-features-store';
import { DependentFeaturesReadModel } from './dependent-features-read-model';
import { FakeDependentFeaturesStore } from './fake-dependent-features-store';
import { FakeDependentFeaturesReadModel } from './fake-dependent-features-read-model';
import EventStore from '../../db/event-store';
import { IUnleashConfig } from '../../types';
import { EventService } from '../../services';
import FeatureTagStore from '../../db/feature-tag-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';

export const createDependentFeaturesService = (
    db: Db,
    config: IUnleashConfig,
): DependentFeaturesService => {
    const { getLogger, eventBus } = config;
    const eventStore = new EventStore(db, getLogger);
    const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
    const eventService = new EventService(
        {
            eventStore,
            featureTagStore,
        },
        config,
    );
    const dependentFeaturesStore = new DependentFeaturesStore(db);
    const dependentFeaturesReadModel = new DependentFeaturesReadModel(db);
    return new DependentFeaturesService(
        dependentFeaturesStore,
        dependentFeaturesReadModel,
        eventService,
    );
};

export const createFakeDependentFeaturesService = (
    config: IUnleashConfig,
): DependentFeaturesService => {
    const eventStore = new FakeEventStore();
    const featureTagStore = new FakeFeatureTagStore();
    const eventService = new EventService(
        {
            eventStore,
            featureTagStore,
        },
        config,
    );
    const dependentFeaturesStore = new FakeDependentFeaturesStore();
    const dependentFeaturesReadModel = new FakeDependentFeaturesReadModel();
    return new DependentFeaturesService(
        dependentFeaturesStore,
        dependentFeaturesReadModel,
        eventService,
    );
};
