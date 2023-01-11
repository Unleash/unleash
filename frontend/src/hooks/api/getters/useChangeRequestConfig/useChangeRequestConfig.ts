import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequestEnvironmentConfig } from 'component/changeRequest/changeRequest.types';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

export const useChangeRequestConfig = (projectId: string) => {
    const { data, error, mutate } = useEnterpriseSWR<
        IChangeRequestEnvironmentConfig[]
    >(
        [],
        Boolean(projectId)
            ? formatApiPath(
                  `api/admin/projects/${projectId}/change-requests/config`
              )
            : null,
        fetcher
    );

    return {
        data: data || [],
        loading: !error && !data,
        refetchChangeRequestConfig: mutate,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then(res => res.json());
};
