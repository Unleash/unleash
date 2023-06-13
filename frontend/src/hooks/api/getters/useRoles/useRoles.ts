import IRole, { IProjectRole } from 'interfaces/role';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

const ROOT_ROLES = ['root', 'root-custom'];
const PROJECT_ROLES = ['project', 'custom'];

export const useRoles = () => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise(),
        { roles: [], projectRoles: [] },
        formatApiPath(`api/admin/roles`),
        fetcher
    );

    return useMemo(
        () => ({
            roles: (data?.roles.filter(({ type }: IRole) =>
                ROOT_ROLES.includes(type)
            ) ?? []) as IRole[],
            projectRoles: (data?.roles.filter(({ type }: IRole) =>
                PROJECT_ROLES.includes(type)
            ) ?? []) as IProjectRole[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Roles'))
        .then(res => res.json());
};
