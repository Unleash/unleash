import { IDependentFeaturesStore } from './dependent-features-store-type';

export class FakeDependentFeaturesStore implements IDependentFeaturesStore {
    async upsert(): Promise<void> {
        return Promise.resolve();
    }

    getChildren(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getParentOptions(): Promise<string[]> {
        return Promise.resolve([]);
    }

    delete(): Promise<void> {
        return Promise.resolve();
    }

    deleteAll(): Promise<void> {
        return Promise.resolve();
    }
}
