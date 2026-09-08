import type { IDependentFeaturesStore } from './dependent-features-store-type.js';

export class FakeDependentFeaturesStore implements IDependentFeaturesStore {
    async upsert(): Promise<void> {
        return Promise.resolve();
    }

    delete(): Promise<number> {
        return Promise.resolve(0);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve();
    }
}
