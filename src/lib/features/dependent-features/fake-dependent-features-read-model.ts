import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { IDependency, IFeatureDependency } from '../../types';

export class FakeDependentFeaturesReadModel
    implements IDependentFeaturesReadModel
{
    getDependencies(): Promise<IFeatureDependency[]> {
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

    haveDependencies(): Promise<boolean> {
        return Promise.resolve(false);
    }

    getOrphanParents(parentsAndChildren: string[]): Promise<string[]> {
        return Promise.resolve([]);
    }

    hasAnyDependencies(): Promise<boolean> {
        return Promise.resolve(false);
    }
}
