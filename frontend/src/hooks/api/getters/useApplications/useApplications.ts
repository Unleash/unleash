import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useEffect, useState } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ApplicationsSchema, GetApplicationsParams } from '../../../../openapi';
import { useClearSWRCache } from '../../../useClearSWRCache';

interface IUseApplicationsOutput extends ApplicationsSchema {
    refetchApplications: () => void;
    loading: boolean;
    error?: Error;
}

const PREFIX_KEY = 'api/admin/metrics/applications?';

const useApplications = (
    params: GetApplicationsParams = {},
    options: SWRConfiguration = {},
): IUseApplicationsOutput => {
    const urlSearchParams = new URLSearchParams(
        Array.from(
            Object.entries(params)
                .filter(([_, value]) => !!value)
                .map(([key, value]) => [key, value.toString()]),
        ),
    ).toString();

    const KEY = `${PREFIX_KEY}${urlSearchParams}`;
    useClearSWRCache(KEY, PREFIX_KEY);

    const fetcher = async () => {
        return fetch(formatApiPath(KEY), {
            method: 'GET',
        })
            .then(handleErrorResponses('Applications data'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR(KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetchApplications = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        applications: data?.applications || [],
        total: data?.total || 0,
        error,
        loading,
        refetchApplications,
    };
};

export default useApplications;
