import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';

import {
    IProjectEnvironmentPermissions,
    IProjectRolePermissions,
    IPermission,
} from '../../../../interfaces/project';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUseProjectRolePermissions {
    permissions:
        | IProjectRolePermissions
        | {
              project: IPermission[];
              environments: IProjectEnvironmentPermissions[];
          };
    loading: boolean;
    refetch: () => void;
    error: any;
}

const useProjectRolePermissions = (
    options: SWRConfiguration = {}
): IUseProjectRolePermissions => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/permissions`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Project permissions'))
            .then(res => res.json());
    };

    const KEY = `api/admin/permissions`;

    const { data, error } = useSWR<{ permissions: IProjectRolePermissions }>(
        KEY,
        fetcher,
        options
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        permissions: data?.permissions || { project: [], environments: [] },
        error,
        loading,
        refetch,
    };
};

export default useProjectRolePermissions;
