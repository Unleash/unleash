import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { IDependency } from '../../types';

export class FakeDependentFeaturesReadModel
    implements IDependentFeaturesReadModel
{
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
}
