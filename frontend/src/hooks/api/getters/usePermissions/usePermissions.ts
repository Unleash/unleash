import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';

import { IPermissions } from 'interfaces/permissions';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUsePermissions {
    permissions: IPermissions;
    loading: boolean;
    refetch: () => void;
    error: any;
}

const usePermissions = (options: SWRConfiguration = {}): IUsePermissions => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/permissions`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Project permissions'))
            .then(res => res.json());
    };

    const KEY = `api/admin/permissions`;

    const { data, error } = useSWR<{ permissions: IPermissions }>(
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
        permissions: data?.permissions || {
            root: [],
            project: [],
            environments: [],
        },
        error,
        loading,
        refetch,
    };
};

export default usePermissions;
