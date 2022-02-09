import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const path = formatApiPath(`api/admin/metrics/applications`);
const KEY = `api/admin/metrics/applications`;

const useApplicationsForStrategy = (
    strategyName: string,
    options: SWRConfiguration = {}
) => {
    const fetcher = async () => {
        const res = await fetch(`${path}?strategyName=${strategyName}`, {
            method: 'GET',
        }).then(handleErrorResponses('Application'));
        return res.json();
    };

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchAddons = () => {
        mutate(KEY);
    };

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

export default useApplicationsForStrategy;
