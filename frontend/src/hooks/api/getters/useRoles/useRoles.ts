import { IRole } from 'interfaces/role';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import {
    PROJECT_ROLE_TYPES,
    ROOT_ROLE_TYPE,
    ROOT_ROLE_TYPES,
    PREDEFINED_ROLE_TYPES,
} from '@server/util/constants';

interface IUseRolesOutput {
    roles: IRole[];
    projectRoles: IRole[];
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useRoles = (): IUseRolesOutput => {
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
                    .filter(({ type }: IRole) => type === ROOT_ROLE_TYPE)
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
                            ? ROOT_ROLE_TYPES.includes(type)
                            : type === ROOT_ROLE_TYPE
                    )
                    .sort(sortRoles) ?? []) as IRole[],
                projectRoles: (data?.roles
                    .filter(({ type }: IRole) =>
                        PROJECT_ROLE_TYPES.includes(type)
                    )
                    .sort(sortRoles) ?? []) as IRole[],
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
    if (
        PREDEFINED_ROLE_TYPES.includes(a.type) &&
        !PREDEFINED_ROLE_TYPES.includes(b.type)
    ) {
        return -1;
    } else if (
        !PREDEFINED_ROLE_TYPES.includes(a.type) &&
        PREDEFINED_ROLE_TYPES.includes(b.type)
    ) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
};
