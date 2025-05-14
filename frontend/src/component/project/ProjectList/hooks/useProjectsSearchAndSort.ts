import { useMemo } from 'react';
import { safeRegExp } from '@server/util/escape-regex';
import type { sortKeys } from '../ProjectsListSort/ProjectsListSort.jsx';
import type { ProjectSchema } from 'openapi';

export const useProjectsSearchAndSort = (
    projects: ProjectSchema[],
    query?: string | null,
    sortBy?: (typeof sortKeys)[number] | null,
) =>
    useMemo(() => {
        const regExp = safeRegExp(query || '', 'i');
        return (
            query
                ? projects.filter((project) => regExp.test(project.name))
                : projects
        )
            .sort((a, b) => {
                const aVal = `${a.name || ''}`.toLowerCase();
                const bVal = `${b.name || ''}`.toLowerCase();
                return aVal?.localeCompare(bVal);
            })
            .sort((a, b) => {
                if (sortBy === 'created') {
                    const aVal = new Date(a.createdAt || 0);
                    const bVal = new Date(b.createdAt || 0);
                    return bVal?.getTime() - aVal?.getTime();
                }

                if (sortBy === 'updated') {
                    const aVal = new Date(a.lastUpdatedAt || a.createdAt || 0);
                    const bVal = new Date(b.lastUpdatedAt || b.createdAt || 0);
                    return bVal?.getTime() - aVal?.getTime();
                }

                if (sortBy === 'seen') {
                    const aVal = new Date(a.lastReportedFlagUsage || 0);
                    const bVal = new Date(b.lastReportedFlagUsage || 0);
                    return bVal?.getTime() - aVal?.getTime();
                }

                return 0;
            })
            .sort((a, b) => {
                if (a?.favorite && !b?.favorite) {
                    return -1;
                }
                if (!a?.favorite && b?.favorite) {
                    return 1;
                }
                return 0;
            });
    }, [projects, query, sortBy]);
