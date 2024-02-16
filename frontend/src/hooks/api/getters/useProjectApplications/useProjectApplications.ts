import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import {
    GetProjectApplicationsParams,
    ProjectApplicationsSchema,
} from 'openapi';

type UseProjectApplicationsOutput = {
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

const getPrefixKey = (projectId: string) => {
    return `api/admin/projects/${projectId}/applications?`;
};

const createProjectApplications = () => {
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

    return (
        projectId: string,
        params: GetProjectApplicationsParams,
        options: SWRConfiguration = {},
    ): UseProjectApplicationsOutput => {
        const { KEY, fetcher } = getProjectApplicationsFetcher(
            projectId,
            params,
        );

        const { data, error, mutate, isLoading } =
            useSWR<ProjectApplicationsSchema>(KEY, fetcher, options);

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        const returnData = data || fallbackData;
        return {
            ...returnData,
            loading: isLoading,
            error,
            refetch,
            initialLoad: isLoading,
        };
    };
};

export const DEFAULT_PAGE_LIMIT = 25;

export const useProjectApplications = createProjectApplications();

const getProjectApplicationsFetcher = (
    projectId: string,
    params: GetProjectApplicationsParams,
) => {
    const urlSearchParams = new URLSearchParams(
        Array.from(
            Object.entries(params)
                .filter(([_, value]) => !!value)
                .map(([key, value]) => [key, value.toString()]), // TODO: parsing non-string parameters
        ),
    ).toString();
    const KEY = `${getPrefixKey(projectId)}${urlSearchParams}`;
    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Feature search'))
            .then((res) => res.json());
    };

    return {
        fetcher,
        KEY,
    };
};
