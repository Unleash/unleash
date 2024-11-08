import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter';
import type { ProjectStatusSchema } from '../../../../openapi';
import { formatApiPath } from 'utils/formatPath';

const path = (projectId: string) => `api/admin/projects/${projectId}/status`;

const placeholderData: ProjectStatusSchema = {
    activityCountByDate: [],
    resources: {
        connectedEnvironments: 0,
        members: 0,
        apiTokens: 0,
        segments: 0,
    },
    averageHealth: 0,
};

export const useProjectStatus = (projectId: string) => {
    const projectPath = formatApiPath(path(projectId));
    const { data, refetch, loading, error } = useApiGetter<ProjectStatusSchema>(
        projectPath,
        () => fetcher(projectPath, 'Project Status'),
    );

    return { data: data || placeholderData, refetch, loading, error };
};
