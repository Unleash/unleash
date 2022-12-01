import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
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
    const { data, error, mutate } = useSWR<IProject>(KEY, fetcher, options);

    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);

    return {
        project: data || fallbackProject,
        loading: !error && !data,
        error,
        refetch,
    };
};

export const useProjectNameOrId = (id: string): string => {
    return useProject(id).project.name || id;
};

export default useProject;
