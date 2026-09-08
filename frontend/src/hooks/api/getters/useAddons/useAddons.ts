import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect, useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import type { AddonsSchema } from 'openapi';

const useAddons = (options: SWRConfiguration = {}) => {
    const projectId = useOptionalPathParam('projectId');
    const query = projectId ? `?project=${projectId}` : '';
    const key = `api/admin/addons${query}`;

    const fetcher = async () => {
        const path = formatApiPath(key);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Addons'));
        return res.json();
    };

    const { data, error } = useSWR<AddonsSchema>(key, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchAddons = useCallback(() => {
        mutate(key);
    }, [key]);

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        addons: data?.addons || [],
        providers: data?.providers || [],
        error,
        loading,
        refetchAddons,
    };
};

export default useAddons;
