import useSWR, { SWRConfiguration, useSWRConfig } from 'swr';
import { useCallback, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ProjectApplicationsSchema } from 'openapi';

type UseApplicationSearchOutput = {
    loading: boolean;
    initialLoad: boolean;
    error: string;
    refetch: () => void;
} & ProjectApplicationsSchema;

type CacheValue = {
    total: number;
    initialLoad: boolean;
    [key: string]: number | boolean;
};

type InternalCache = Record<string, CacheValue>;

const fallbackData: ProjectApplicationsSchema = {
    applications: [],
    total: 0,
};

const PREFIX_KEY = 'api/projects/';

/**
 With dynamic search and filter parameters we want to prevent cache from growing extensively.
 We only keep the latest cache key `currentKey` and remove all other entries identified
 by the `clearPrefix`
 */
const useClearSWRCache = (currentKey: string, clearPrefix: string) => {
    const { cache } = useSWRConfig();
    const keys = [...cache.keys()];
    keys.filter((key) => key !== currentKey && key.startsWith(clearPrefix)).map(
        (key) => cache.delete(key),
    );
};

const createApplicationSearch = () => {
    const internalCache: InternalCache = {};

    const initCache = (id: string) => {
        internalCache[id] = {
            total: 0,
            initialLoad: true,
        };
    };

    const set = (id: string, key: string, value: number | boolean) => {
        if (!internalCache[id]) {
            initCache(id);
        }
        internalCache[id][key] = value;
    };

    const get = (id: string) => {
        if (!internalCache[id]) {
            initCache(id);
        }
        return internalCache[id];
    };

    return (
        id: string,
        options: SWRConfiguration = {},
    ): UseApplicationSearchOutput => {
        const KEY = `${PREFIX_KEY}${id}/applications`;
        useClearSWRCache(KEY, PREFIX_KEY);

        useEffect(() => {
            initCache(id);
        }, [id]);

        const { data, error, mutate, isLoading } =
            useSWR<ProjectApplicationsSchema>(
                KEY,
                async () => {
                    const path = formatApiPath(KEY);
                    return fetch(path, {
                        method: 'GET',
                    })
                        .then(handleErrorResponses('Project Applications'))
                        .then((res) => res.json());
                },
                options,
            );

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        const cacheValues = get(id);

        if (!isLoading && cacheValues.initialLoad) {
            set(id, 'initialLoad', false);
        }

        const returnData = data || fallbackData;
        return {
            ...returnData,
            loading: isLoading,
            error,
            refetch,
            initialLoad: isLoading && cacheValues.initialLoad,
        };
    };
};

export const useApplicationSearch = createApplicationSearch();
