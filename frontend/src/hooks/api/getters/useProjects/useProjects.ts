import useSWR, { type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';

import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { GetProjectsParams, ProjectsSchema } from 'openapi';

export const PROJECTS_KEY = 'api/admin/projects';

const useProjects = (options: SWRConfiguration & GetProjectsParams = {}) => {
    const KEY = `${PROJECTS_KEY}${options.archived ? '?archived=true' : ''}`;

    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Projects'))
            .then((res) => res.json());
    };

    const { data, error, mutate } = useSWR<{
        projects: ProjectsSchema['projects'];
    }>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate();
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
