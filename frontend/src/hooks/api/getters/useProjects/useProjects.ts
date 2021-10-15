import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';

import { IProjectCard } from '../../../../interfaces/project';
import handleErrorResponses from '../httpErrorResponseHandler';

const useProjects = () => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/projects`);
        return fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Projects')).then(res => res.json());
    };

    const KEY = `api/admin/projects`;

    const { data, error } = useSWR<{ projects: IProjectCard[] }>(KEY, fetcher);
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
