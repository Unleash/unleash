import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect, useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IAddon, IAddonProvider } from 'interfaces/addons';

interface IAddonsResponse {
    addons: IAddon[];
    providers: IAddonProvider[];
}

const useAddons = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/addons`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Addons'));
        return res.json();
    };

    const KEY = `api/admin/addons`;

    const { data, error } = useSWR<IAddonsResponse>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchAddons = useCallback(() => {
        mutate(KEY);
    }, [KEY]);

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
