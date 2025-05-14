import { useMemo } from 'react';
import { groupProjects } from '../group-projects.js';
import type { ProjectSchema } from 'openapi';

export const useGroupedProjects = (
    filteredAndSortedProjects: ProjectSchema[],
    myProjects: Set<string>,
) =>
    useMemo(
        () => groupProjects(myProjects, filteredAndSortedProjects),
        [filteredAndSortedProjects, myProjects],
    );
