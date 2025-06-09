import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import type { ProjectStatusSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';

const path = (projectId: string) => `api/admin/projects/${projectId}/status`;

const placeholderData: ProjectStatusSchema = {
    activityCountByDate: [],
    resources: {
        members: 0,
        apiTokens: 0,
        segments: 0,
    },
    health: {
        current: 0,
    },
    technicalDebt: {
        current: 0,
    },
    lifecycleSummary: {
        initial: {
            currentFlags: 0,
            averageDays: null,
        },
        preLive: {
            currentFlags: 0,
            averageDays: null,
        },
        live: {
            currentFlags: 0,
            averageDays: null,
        },
        completed: {
            currentFlags: 0,
            averageDays: null,
        },
        archived: {
            currentFlags: 0,
            last30Days: 0,
        },
    },
    staleFlags: {
        total: 0,
    },
};

export const useProjectStatus = (projectId: string) => {
    const projectPath = formatApiPath(path(projectId));
    const { data, refetch, loading, error } = useApiGetter<ProjectStatusSchema>(
        projectPath,
        () => fetcher(projectPath, 'Project Status'),
    );

    return { data: data || placeholderData, refetch, loading, error };
};
