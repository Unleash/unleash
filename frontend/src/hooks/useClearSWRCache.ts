import { useSWRConfig } from 'swr';

type Cache = ReturnType<typeof useSWRConfig>['cache'];

export const clearCacheEntries = (
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
    clearCacheEntries(cache, currentKey, clearPrefix, SWR_CACHE_SIZE);
};
