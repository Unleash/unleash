import { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import IRole from 'interfaces/role';
import useUiConfig from '../useUiConfig/useUiConfig';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';

export interface IUseRoleOutput {
    role?: IRole;
    refetch: () => void;
    loading: boolean;
    error?: Error;
}

export const useRole = (
    id?: string,
    options: SWRConfiguration = {}
): IUseRoleOutput => {
    const { isEnterprise } = useUiConfig();

    const fetcher = () => {
        const path = formatApiPath(`api/admin/roles/${id}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('role'))
            .then(res => res.json());
    };

    const { data, error } = useConditionalSWR(
        Boolean(id) && isEnterprise(),
        undefined,
        `api/admin/roles/${id}`,
        fetcher,
        options
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(`api/admin/roles/${id}`);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        role: data as IRole,
        error,
        loading,
        refetch,
    };
};
