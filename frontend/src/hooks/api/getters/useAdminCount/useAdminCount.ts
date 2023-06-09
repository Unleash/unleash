import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export interface IAdminCount {
    password: number;
    noPassword: number;
    service: number;
}

export const useAdminCount = () => {
    const { data, error, mutate } = useSWR<IAdminCount>(
        formatApiPath(`api/admin/user-admin/admin-count`),
        fetcher
    );

    return {
        data,
        loading: !error && !data,
        refetch: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Admin count'))
        .then(res => res.json());
};
