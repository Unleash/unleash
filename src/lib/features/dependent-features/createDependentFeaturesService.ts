import { Db } from '../../db/db';
import { DependentFeaturesService } from './dependent-features-service';
import { DependentFeaturesStore } from './dependent-features-store';
import { DependentFeaturesReadModel } from './dependent-features-read-model';
import { FakeDependentFeaturesStore } from './fake-dependent-features-store';
import { FakeDependentFeaturesReadModel } from './fake-dependent-features-read-model';

export const createDependentFeaturesService = (
    db: Db,
): DependentFeaturesService => {
    const dependentFeaturesStore = new DependentFeaturesStore(db);
    const dependentFeaturesReadModel = new DependentFeaturesReadModel(db);
    return new DependentFeaturesService(
        dependentFeaturesStore,
        dependentFeaturesReadModel,
    );
};

export const createFakeDependentFeaturesService =
    (): DependentFeaturesService => {
        const dependentFeaturesStore = new FakeDependentFeaturesStore();
        const dependentFeaturesReadModel = new FakeDependentFeaturesReadModel();
        return new DependentFeaturesService(
            dependentFeaturesStore,
            dependentFeaturesReadModel,
        );
    };
