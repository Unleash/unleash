import { IRole } from 'interfaces/role';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import {
    PROJECT_ROLE_TYPES,
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
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise(),
        { roles: [], projectRoles: [] },
        formatApiPath(`api/admin/roles`),
        fetcher
    );

    return useMemo(
        () => ({
            roles: (data?.roles
                .filter(({ type }: IRole) => ROOT_ROLE_TYPES.includes(type))
                .sort(sortRoles) ?? []) as IRole[],
            projectRoles: (data?.roles
                .filter(({ type }: IRole) => PROJECT_ROLE_TYPES.includes(type))
                .sort(sortRoles) ?? []) as IRole[],
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
