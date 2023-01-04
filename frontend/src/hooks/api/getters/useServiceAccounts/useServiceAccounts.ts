import IRole from 'interfaces/role';
import { IUser } from 'interfaces/user';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

export const useServiceAccounts = () => {
    const { uiConfig, isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        Boolean(uiConfig.flags.serviceAccounts) && isEnterprise(),
        { users: [], rootRoles: [] },
        formatApiPath(`api/admin/service-account`),
        fetcher
    );

    return useMemo(
        () => ({
            serviceAccounts: (data?.users ?? []) as IUser[],
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
        .then(handleErrorResponses('Service Accounts'))
        .then(res => res.json());
};
