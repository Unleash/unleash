import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import IRole from 'interfaces/role';
import { IAccount } from '@server/types/account';

export const useAccounts = () => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/account`),
        fetcher
    );

    return useMemo(
        () => ({
            accounts: (data?.accounts ?? []) as IAccount[],
            roles: (data?.rootRoles ?? []) as IRole[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Accounts'))
        .then(res => res.json());
};
