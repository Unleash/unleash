import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IGroup } from 'interfaces/group';
import { IUser } from 'interfaces/user';
import { IServiceAccount } from 'interfaces/service-account';

export interface IUseAccessOutput {
    users?: IUser[];
    serviceAccounts?: IServiceAccount[];
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
        users: (data?.users as IUser[])?.filter(
            ({ accountType }) => !accountType || accountType === 'User'
        ),
        serviceAccounts: (data?.users as IServiceAccount[])?.filter(
            ({ accountType }) => accountType === 'Service Account'
        ),
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
