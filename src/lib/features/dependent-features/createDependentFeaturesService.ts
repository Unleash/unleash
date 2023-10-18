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
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel';
import { FeaturesReadModel } from '../feature-toggle/features-read-model';
import { FakeFeaturesReadModel } from '../feature-toggle/fakes/fake-features-read-model';

export const createDependentFeaturesService =
    (config: IUnleashConfig) => (db: Db): DependentFeaturesService => {
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
        const changeRequestAccessReadModel = createChangeRequestAccessReadModel(
            db,
            config,
        );
        const featuresReadModel = new FeaturesReadModel(db);
        return new DependentFeaturesService({
            dependentFeaturesStore,
            dependentFeaturesReadModel,
            changeRequestAccessReadModel,
            featuresReadModel,
            eventService,
        });
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
    const changeRequestAccessReadModel = createFakeChangeRequestAccessService();
    const featuresReadModel = new FakeFeaturesReadModel();

    return new DependentFeaturesService({
        dependentFeaturesStore,
        dependentFeaturesReadModel,
        changeRequestAccessReadModel,
        featuresReadModel,
        eventService,
    });
};
