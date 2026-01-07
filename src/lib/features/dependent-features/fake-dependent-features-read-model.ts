import type { IDependentFeaturesReadModel } from './dependent-features-read-model-type.js';
import type { IDependency, IFeatureDependency } from '../../types/index.js';

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

    getPossibleParentFeatures(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getPossibleParentVariants(): Promise<string[]> {
        return Promise.resolve([]);
    }

    haveDependencies(): Promise<boolean> {
        return Promise.resolve(false);
    }

    getOrphanParents(_parentsAndChildren: string[]): Promise<string[]> {
        return Promise.resolve([]);
    }

    hasAnyDependencies(): Promise<boolean> {
        return Promise.resolve(false);
    }
}
