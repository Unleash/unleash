import { useSWRConfig } from 'swr';

type Cache = ReturnType<typeof useSWRConfig>['cache'];

type ClearCacheEntriesProps = {
    cache: Cache;
    currentKey: string;
    clearPrefix: string;
    cacheSize?: number;
};

export const clearCacheEntries = ({
    cache,
    currentKey,
    clearPrefix,
    cacheSize = 1,
}: ClearCacheEntriesProps) => {
    const keys = [...cache.keys()];

    const filteredKeys = keys.filter(
        (key) => key.startsWith(clearPrefix) && key !== currentKey,
    );

    const entriesToKeep = cacheSize - 1;
    const keysToDelete =
        entriesToKeep <= 0
            ? filteredKeys
            : filteredKeys.slice(0, -entriesToKeep);

    keysToDelete.forEach((key) => {
        cache.delete(key);
    });
};

type UseClearSWRCacheProps = {
    currentKey: string;
    clearPrefix: string;
    cacheSize?: number;
};

/**
 With dynamic search and filter parameters we want to prevent cache from growing extensively.
 We only keep the latest cache key `currentKey` and remove all other entries identified
 by the `clearPrefix`
 */
export const useClearSWRCache = ({
    currentKey,
    clearPrefix,
    cacheSize = 1,
}: UseClearSWRCacheProps) => {
    const { cache } = useSWRConfig();
    clearCacheEntries({
        cache,
        currentKey,
        clearPrefix,
        cacheSize,
    });
};
