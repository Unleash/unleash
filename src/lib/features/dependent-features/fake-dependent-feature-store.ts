import { IDependentFeaturesStore } from './dependent-feature-store-type';

export class FakeDependentFeaturesStore implements IDependentFeaturesStore {
    async upsert(): Promise<void> {
        return Promise.resolve();
    }
}
