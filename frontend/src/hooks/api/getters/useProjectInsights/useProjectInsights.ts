import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter';
import type { ProjectInsightsSchema } from '../../../../openapi';
import { formatApiPath } from 'utils/formatPath';

const path = (projectId: string) => `api/admin/projects/${projectId}/insights`;

const placeholderData: ProjectInsightsSchema = {
    stats: {
        avgTimeToProdCurrentWindow: 0,
        createdCurrentWindow: 0,
        createdPastWindow: 0,
        archivedCurrentWindow: 0,
        archivedPastWindow: 0,
        projectActivityCurrentWindow: 0,
        projectActivityPastWindow: 0,
        projectMembersAddedCurrentWindow: 0,
    },
    featureTypeCounts: [
        {
            type: 'experiment',
            count: 0,
        },
        {
            type: 'permission',
            count: 0,
        },
        {
            type: 'release',
            count: 0,
        },
    ],
    leadTime: {
        projectAverage: 0,
        features: [],
    },
    health: {
        rating: 0,
        activeCount: 0,
        potentiallyStaleCount: 0,
        staleCount: 0,
    },
    members: {
        currentMembers: 0,
        change: 0,
    },
};

export const useProjectInsights = (projectId: string) => {
    const projectPath = formatApiPath(path(projectId));
    const { data, refetch, loading, error } =
        useApiGetter<ProjectInsightsSchema>(projectPath, () =>
            fetcher(projectPath, 'Outdated SDKs'),
        );

    return { data: data || placeholderData, refetch, loading, error };
};
