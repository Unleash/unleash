import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';

export class FakeDependentFeaturesReadModel
    implements IDependentFeaturesReadModel
{
    getChildren(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getParents(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getParentOptions(): Promise<string[]> {
        return Promise.resolve([]);
    }
}
