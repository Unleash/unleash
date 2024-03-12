import type { Db } from '../../db/db';
import { DependentFeaturesService } from './dependent-features-service';
import { DependentFeaturesStore } from './dependent-features-store';
import { DependentFeaturesReadModel } from './dependent-features-read-model';
import { FakeDependentFeaturesStore } from './fake-dependent-features-store';
import { FakeDependentFeaturesReadModel } from './fake-dependent-features-read-model';
import type { IUnleashConfig } from '../../types';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel';
import { FeaturesReadModel } from '../feature-toggle/features-read-model';
import { FakeFeaturesReadModel } from '../feature-toggle/fakes/fake-features-read-model';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';

export const createDependentFeaturesService =
    (config: IUnleashConfig) =>
    (db: Db): DependentFeaturesService => {
        const eventService = createEventsService(db, config);
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
    const eventService = createFakeEventsService(config);
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
