export const releaseTemplatesApiPath = (projectId?: string) =>
    projectId
        ? `api/admin/projects/${projectId}/release-templates`
        : 'api/admin/release-plan-templates';
