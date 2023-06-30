import { SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IRoleWithPermissions } from 'interfaces/role';
import useUiConfig from '../useUiConfig/useUiConfig';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';

export interface IUseRoleOutput {
    role?: IRoleWithPermissions;
    refetch: () => void;
    loading: boolean;
    error?: Error;
}

export const useRole = (
    id?: string,
    options: SWRConfiguration = {}
): IUseRoleOutput => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        Boolean(id) && isEnterprise(),
        undefined,
        formatApiPath(`api/admin/roles/${id}`),
        fetcher,
        options
    );

    return useMemo(
        () => ({
            role: data as IRoleWithPermissions,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Role'))
        .then(res => res.json());
};
