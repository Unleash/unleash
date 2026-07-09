export const formatReleaseTemplateListPath = (projectId?: string) =>
    projectId
        ? `/projects/${projectId}/settings/release-templates`
        : '/release-templates';

export const formatReleaseTemplateEditPath = (
    templateId: string,
    projectId?: string,
) => `${formatReleaseTemplateListPath(projectId)}/edit/${templateId}`;
