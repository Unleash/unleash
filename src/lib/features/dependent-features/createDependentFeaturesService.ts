import type { Db } from '../../db/db.js';
import { DependentFeaturesService } from './dependent-features-service.js';
import { DependentFeaturesStore } from './dependent-features-store.js';
import { DependentFeaturesReadModel } from './dependent-features-read-model.js';
import { FakeDependentFeaturesStore } from './fake-dependent-features-store.js';
import { FakeDependentFeaturesReadModel } from './fake-dependent-features-read-model.js';
import type { IUnleashConfig } from '../../types/index.js';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel.js';
import { FeaturesReadModel } from '../feature-toggle/features-read-model.js';
import { FakeFeaturesReadModel } from '../feature-toggle/fakes/fake-features-read-model.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

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
