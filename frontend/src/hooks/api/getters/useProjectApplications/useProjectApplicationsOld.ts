import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ProjectApplicationsSchema } from 'openapi';

const useProjectApplicationsOld = (
    id: string,
    options: SWRConfiguration = {},
) => {
    const KEY = `api/projects/${id}/applications`;
    const fetcher = async () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Project Applications'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR<ProjectApplicationsSchema>(
        KEY,
        fetcher,
        options,
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetchApplications = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        applications: data || [],
        error,
        loading,
        refetchApplications,
    };
};

export default useProjectApplicationsOld;
