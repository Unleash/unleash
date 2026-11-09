import { useMemo } from 'react';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import type { ProjectSchema } from 'openapi';
import type { sortKeys } from '../ProjectsListSort/ProjectsListSort.jsx';
import { useProjectsSearchAndSort } from './useProjectsSearchAndSort.js';
import { useGroupedProjects } from './useGroupedProjects.js';

export const useMyProjects = (
    projects: ProjectSchema[],
    query?: string | null,
    sortBy?: (typeof sortKeys)[number] | null,
) => {
    const { profile, loading, error } = useProfile();
    const myProjectIds = useMemo(
        () => new Set(profile?.projects ?? []),
        [profile],
    );
    const sortedProjects = useProjectsSearchAndSort(projects, query, sortBy);
    const { myProjects, otherProjects } = useGroupedProjects(
        sortedProjects,
        myProjectIds,
    );

    return {
        sortedProjects,
        myProjects,
        otherProjects,
        profileLoading: loading,
        profileError: error,
    };
};
