import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useApplication = (name: string, options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/metrics/applications/${name}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Application'))
            .then(res => res.json());
    };

    const FEATURE_CACHE_KEY = `api/admin/metrics/applications/${name}`;

    const { data, error } = useSWR(FEATURE_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetchApplication = () => {
        mutate(FEATURE_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        application: data || {
            appName: name,
            color: null,
            createdAt: '2022-02-02T21:04:00.268Z',
            descriotion: '',
            instances: [],
            strategies: [],
            seenToggles: [],
            url: '',
        },
        error,
        loading,
        refetchApplication,
        FEATURE_CACHE_KEY,
    };
};

export default useApplication;
