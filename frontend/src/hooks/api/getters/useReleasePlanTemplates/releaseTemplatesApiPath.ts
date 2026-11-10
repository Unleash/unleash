export const releaseTemplatesApiPath = (
    projectId?: string,
    options?: { includeRoot?: boolean },
) =>
    projectId
        ? `api/admin/projects/${projectId}/release-templates${
              options?.includeRoot ? '?include=root' : ''
          }`
        : 'api/admin/release-plan-templates';
