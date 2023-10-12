import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { IDependency } from '../../types';
import { FeatureDependency } from './dependent-features';

export class FakeDependentFeaturesReadModel
    implements IDependentFeaturesReadModel
{
    getFeatureDependenciesByChildren(): Promise<FeatureDependency[]> {
        return Promise.resolve([]);
    }
    getChildren(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getParents(): Promise<IDependency[]> {
        return Promise.resolve([]);
    }

    getParentOptions(): Promise<string[]> {
        return Promise.resolve([]);
    }

    hasDependencies(): Promise<boolean> {
        return Promise.resolve(false);
    }

    getOrphanParents(parentsAndChildren: string[]): Promise<string[]> {
        return Promise.resolve([]);
    }
}
