import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';

import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { GetProjectsParams, ProjectsSchema } from 'openapi';

const useProjects = (options: SWRConfiguration & GetProjectsParams = {}) => {
    const KEY = `api/admin/projects${options.archived ? '?archived=true' : ''}`;

    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Projects'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR<{ projects: ProjectsSchema['projects'] }>(
        KEY,
        fetcher,
        options,
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        projects: data?.projects || [],
        error,
        loading,
        refetch,
    };
};

export default useProjects;
