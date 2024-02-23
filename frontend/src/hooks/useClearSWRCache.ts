import { useSWRConfig } from 'swr';

/**
 With dynamic search and filter parameters we want to prevent cache from growing extensively.
 We only keep the latest cache key `currentKey` and remove all other entries identified
 by the `clearPrefix`
 */
export const useClearSWRCache = (currentKey: string, clearPrefix: string) => {
    const { cache } = useSWRConfig();
    const keys = [...cache.keys()];
    keys.filter((key) => key !== currentKey && key.startsWith(clearPrefix)).map(
        (key) => cache.delete(key),
    );
};
