import { type State, useSWRConfig } from 'swr';

interface Cache<Data = any> {
    keys(): IterableIterator<string>;
    get(key: string): State<Data> | undefined;
    set(key: string, value: State<Data>): void;
    delete(key: string): void;
}

export const manageCacheEntries = (
    cache: Cache,
    currentKey: string,
    clearPrefix: string,
    SWR_CACHE_SIZE = 1,
) => {
    const keys = [...cache.keys()];

    const filteredKeys = keys.filter(
        (key) => key.startsWith(clearPrefix) && key !== currentKey,
    );
    const keysToDelete = filteredKeys.slice(SWR_CACHE_SIZE - 1);

    keysToDelete.forEach((key) => cache.delete(key));
};

/**
 With dynamic search and filter parameters we want to prevent cache from growing extensively.
 We only keep the latest cache key `currentKey` and remove all other entries identified
 by the `clearPrefix`
 */
export const useClearSWRCache = (
    currentKey: string,
    clearPrefix: string,
    SWR_CACHE_SIZE = 1,
) => {
    const { cache } = useSWRConfig();
    manageCacheEntries(cache, currentKey, clearPrefix, SWR_CACHE_SIZE);
};
