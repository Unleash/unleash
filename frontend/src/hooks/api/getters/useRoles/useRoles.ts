import IRole, { IProjectRole } from 'interfaces/role';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

const ROOT_ROLE = 'root';
const ROOT_ROLES = [ROOT_ROLE, 'root-custom'];
const PROJECT_ROLES = ['project', 'custom'];

export const useRoles = () => {
    const { isEnterprise, uiConfig } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise(),
        { roles: [], projectRoles: [] },
        formatApiPath(`api/admin/roles`),
        fetcher
    );

    const {
        data: ossData,
        error: ossError,
        mutate: ossMutate,
    } = useConditionalSWR(
        !isEnterprise(),
        { rootRoles: [] },
        formatApiPath(`api/admin/user-admin`),
        fetcher
    );

    return useMemo(() => {
        if (!isEnterprise()) {
            return {
                roles: ossData?.rootRoles
                    .filter(({ type }: IRole) => type === ROOT_ROLE)
                    .sort(sortRoles) as IRole[],
                projectRoles: [],
                loading: !ossError && !ossData,
                refetch: () => ossMutate(),
                error: ossError,
            };
        } else {
            return {
                roles: (data?.roles
                    .filter(({ type }: IRole) =>
                        uiConfig.flags.customRootRoles
                            ? ROOT_ROLES.includes(type)
                            : type === ROOT_ROLE
                    )
                    .sort(sortRoles) ?? []) as IRole[],
                projectRoles: (data?.roles
                    .filter(({ type }: IRole) => PROJECT_ROLES.includes(type))
                    .sort(sortRoles) ?? []) as IProjectRole[],
                loading: !error && !data,
                refetch: () => mutate(),
                error,
            };
        }
    }, [data, error, mutate, ossData, ossError, ossMutate]);
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Roles'))
        .then(res => res.json());
};

export const sortRoles = (a: IRole, b: IRole) => {
    if (a.type === 'root' && b.type !== 'root') {
        return -1;
    } else if (a.type !== 'root' && b.type === 'root') {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
};
