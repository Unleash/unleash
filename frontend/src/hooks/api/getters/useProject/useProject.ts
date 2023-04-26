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
    favorite: false,
    mode: 'open',
    defaultStickiness: 'default',
    stats: {
        archivedCurrentWindow: 0,
        archivedPastWindow: 0,
        avgTimeToProdCurrentWindow: 0,
        createdCurrentWindow: 0,
        createdPastWindow: 0,
        projectActivityCurrentWindow: 0,
        projectActivityPastWindow: 0,
        projectMembersAddedCurrentWindow: 0,
    },
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
