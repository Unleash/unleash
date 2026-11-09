export const formatReleaseTemplateListPath = (projectId?: string) =>
    projectId
        ? `/projects/${projectId}/settings/release-templates`
        : '/release-templates';

export const formatReleaseTemplateCreatePath = (projectId?: string) =>
    `${formatReleaseTemplateListPath(projectId)}/create-template`;

export const formatReleaseTemplateEditPath = (
    templateId: string,
    projectId?: string,
) => `${formatReleaseTemplateListPath(projectId)}/edit/${templateId}`;
