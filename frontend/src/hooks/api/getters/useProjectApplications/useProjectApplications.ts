import type { ProjectApplicationsSchema } from 'openapi';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';

export const DEFAULT_PAGE_LIMIT = 25;

const getPrefixKey = (projectId: string) => {
    return `api/admin/projects/${projectId}/applications?`;
};
const useParameterizedProjectApplications =
    createPaginatedHook<ProjectApplicationsSchema>({
        applications: [],
        total: 0,
    });

export const useProjectApplications = (
    params: Record<string, any>,
    projectId: string,
) => useParameterizedProjectApplications(params, getPrefixKey(projectId));
