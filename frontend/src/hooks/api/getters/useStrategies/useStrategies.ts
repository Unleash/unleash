import useSWR, { mutate } from 'swr';
import { useEffect, useState } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { IStrategy } from '../../../../interfaces/strategy';

export const STRATEGIES_CACHE_KEY = 'api/admin/strategies';

const useStrategies = () => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/strategies`);

        return fetch(path, {
            method: 'GET',
            credentials: 'include',
        }).then(res => res.json());
    };

    const { data, error } = useSWR<{ strategies: IStrategy[] }>(
        STRATEGIES_CACHE_KEY,
        fetcher
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(STRATEGIES_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        strategies: data?.strategies || [],
        error,
        loading,
        refetch,
    };
};

export default useStrategies;
