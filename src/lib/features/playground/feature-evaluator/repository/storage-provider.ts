export interface StorageProvider<T> {
    set(key: string, data: T): Promise<void>;
    get(key: string): Promise<T | undefined>;
}
