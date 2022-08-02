import { StorageProvider } from './storage-provider';

export default class InMemStorageProvider<T> implements StorageProvider<T> {
    private store: Map<string, T> = new Map<string, T>();

    async set(key: string, data: T): Promise<void> {
        this.store.set(key, data);
        return Promise.resolve();
    }

    async get(key: string): Promise<T | undefined> {
        return Promise.resolve(this.store.get(key));
    }
}
