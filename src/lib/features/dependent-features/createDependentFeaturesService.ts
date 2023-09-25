import { Db } from '../../db/db';
import { DependentFeaturesService } from './dependent-features-service';
import { DependentFeaturesStore } from './dependent-features-store';

export const createDependentFeaturesService = (
    db: Db,
): DependentFeaturesService => {
    const dependentFeaturesStore = new DependentFeaturesStore(db);
    return new DependentFeaturesService(dependentFeaturesStore);
};
