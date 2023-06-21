import { SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IRole, IRoleWithPermissions } from 'interfaces/role';
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

    const {
        data: ossData,
        error: ossError,
        mutate: ossMutate,
    } = useConditionalSWR(
        Boolean(id) && !isEnterprise(),
        { rootRoles: [] },
        formatApiPath(`api/admin/user-admin`),
        fetcher,
        options
    );

    return useMemo(() => {
        if (!isEnterprise()) {
            return {
                role: {
                    ...((ossData?.rootRoles ?? []) as IRole[]).find(
                        ({ id: rId }) => rId === +id!
                    ),
                    permissions: [],
                } as IRoleWithPermissions,
                loading: !ossError && !ossData,
                refetch: () => ossMutate(),
                error: ossError,
            };
        } else {
            return {
                role: data as IRoleWithPermissions,
                loading: !error && !data,
                refetch: () => mutate(),
                error,
            };
        }
    }, [data, error, mutate, ossData, ossError, ossMutate]);
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Role'))
        .then(res => res.json());
};
