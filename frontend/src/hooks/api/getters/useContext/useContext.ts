import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useWorkspaceContext } from 'contexts/WorkspaceContext';

const useContext = (name: string, options: SWRConfiguration = {}) => {
    const { currentWorkspaceId } = useWorkspaceContext();
    const [loading, setLoading] = useState(true);

    // Determine the API path based on whether we have a workspace ID
    console.log('WORKSPACE ID', currentWorkspaceId);

    const basePath =
        currentWorkspaceId !== null
            ? `api/admin/workspaces/${currentWorkspaceId}/context`
            : `api/admin/context`;

    const FEATURE_CACHE_KEY = `${basePath}/${name}`;

    const fetcher = async () => {
        const path = formatApiPath(FEATURE_CACHE_KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context data'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR(FEATURE_CACHE_KEY, fetcher, {
        ...options,
    });

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
