import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IApplication } from '../../../../interfaces/application';

interface IUseApplicationOutput {
    application: IApplication;
    refetchApplication: () => void;
    loading: boolean;
    error?: Error;
    APPLICATION_CACHE_KEY: string;
}

const useApplication = (
    name: string,
    options: SWRConfiguration = {}
): IUseApplicationOutput => {
    const path = formatApiPath(`api/admin/metrics/applications/${name}`);

    const fetcher = async () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Application'))
            .then(res => res.json());
    };

    const APPLICATION_CACHE_KEY = `api/admin/metrics/applications/${name}`;

    const { data, error } = useSWR(APPLICATION_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetchApplication = () => {
        mutate(APPLICATION_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        application: data || {
            appName: name,
            color: '',
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
        APPLICATION_CACHE_KEY,
    };
};

export default useApplication;
