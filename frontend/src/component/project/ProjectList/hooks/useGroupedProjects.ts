import { useMemo } from 'react';
import { groupProjects } from '../group-projects';
import type { IProjectCard } from 'interfaces/project';

export const useGroupedProjects = (
    filteredAndSortedProjects: IProjectCard[],
    myProjects: Set<string>,
) =>
    useMemo(
        () => groupProjects(myProjects, filteredAndSortedProjects),
        [filteredAndSortedProjects, myProjects],
    );
