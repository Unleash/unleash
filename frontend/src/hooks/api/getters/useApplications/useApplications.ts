import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IApplication } from '../../../../interfaces/application';

const path = formatApiPath('api/admin/metrics/applications');

interface IUseApplicationsOutput {
    applications: IApplication[];
    refetchApplications: () => void;
    loading: boolean;
    error?: Error;
    APPLICATIONS_CACHE_KEY: string;
}

const useApplications = (
    options: SWRConfiguration = {}
): IUseApplicationsOutput => {
    const fetcher = async () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Applications data'))
            .then(res => res.json());
    };

    const APPLICATIONS_CACHE_KEY = 'api/admin/metrics/applications';

    const { data, error } = useSWR(APPLICATIONS_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetchApplications = () => {
        mutate(APPLICATIONS_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        applications: data?.applications || {},
        error,
        loading,
        refetchApplications,
        APPLICATIONS_CACHE_KEY,
    };
};

export default useApplications;
