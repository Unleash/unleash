import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

type ContextInfo = {
    name: string;
    project?: string;
};

const useContext = (
    { name, project }: ContextInfo,
    options: SWRConfiguration = {},
) => {
    const uri = project
        ? `api/admin/projects/${project}/context/${name}`
        : `api/admin/context/${name}`;

    const fetcher = async () => {
        const path = formatApiPath(uri);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context data'))
            .then((res) => res.json());
    };

    const FEATURE_CACHE_KEY = uri;

    const { data, error } = useSWR(FEATURE_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(FEATURE_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        context: data || {
            name: '',
            description: '',
            legalValues: [],
            stickiness: false,
        },
        error,
        loading,
        refetch,
        FEATURE_CACHE_KEY,
    };
};

export default useContext;
