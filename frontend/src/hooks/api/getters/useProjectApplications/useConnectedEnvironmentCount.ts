import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export type ConnectedEnvironmentCount = {
    total: number;
    environments: string[];
};

export const useConnectedEnvironmentCount = (projectId: string) => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/projects/${projectId}/applications`),
        fetcher,
    );

    console.log(data);

    return {
        data,
        loading: !error && !data,
        refetch: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Connected environment count'))
        .then((res) => res.json());
};
