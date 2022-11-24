import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import useUiConfig from '../useUiConfig/useUiConfig';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then(res => res.json());
};

export const usePendingChangeRequestsForFeature = (
    project: string,
    featureName: string
) => {
    const { isOss } = useUiConfig();
    const { data, error, mutate } = useSWR<IChangeRequest[]>(
        formatApiPath(
            `api/admin/projects/${project}/change-requests/pending/${featureName}`
        ),
        (path: string) => (isOss() ? Promise.resolve([]) : fetcher(path))
    );

    return {
        changeRequests: data,
        loading: !error && !data,
        refetch: mutate,
        error,
    };
};
