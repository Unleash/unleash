import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IGroup } from 'interfaces/group';
import { IUser } from 'interfaces/user';

export interface IUseAccessOutput {
    users?: IUser[];
    groups?: IGroup[];
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useAccess = (): IUseAccessOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/user-admin/access`),
        fetcher
    );

    return {
        users: data?.users,
        groups: data?.groups,
        loading: !error && !data,
        refetch: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Access'))
        .then(res => res.json());
};
