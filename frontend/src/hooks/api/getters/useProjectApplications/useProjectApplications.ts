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
    error: string;
    refetch: () => void;
} & ProjectApplicationsSchema;

const fallbackData: ProjectApplicationsSchema = {
    applications: [],
    total: 0,
};

const getPrefixKey = (projectId: string) => {
    return `api/admin/projects/${projectId}/applications?`;
};

const createProjectApplications = () => {
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
