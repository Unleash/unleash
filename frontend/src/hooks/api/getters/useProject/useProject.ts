import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { getProjectFetcher } from './getProjectFetcher';
import { IProject } from 'interfaces/project';

const fallbackProject: IProject = {
    features: [],
    environments: [],
    name: '',
    health: 0,
    members: 0,
    version: '1',
    description: 'Default',
};

const useProject = (id: string, options: SWRConfiguration = {}) => {
    const { KEY, fetcher } = getProjectFetcher(id);

    const { data, error } = useSWR<IProject>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        project: data || fallbackProject,
        error,
        loading,
        refetch,
    };
};

export default useProject;
