export const formatIntegrationListPath = (projectId?: string): string =>
    projectId
        ? `/projects/${projectId}/settings/integrations`
        : '/integrations';

export const formatIntegrationEditPath = (
    addonId: number,
    projectId?: string,
): string => `${formatIntegrationListPath(projectId)}/edit/${addonId}`;

export const formatIntegrationCreatePath = (
    providerId: string,
    projectId?: string,
): string => `${formatIntegrationListPath(projectId)}/create/${providerId}`;

export const formatIntegrationApiPath = (projectId?: string): string =>
    projectId ? `api/admin/projects/${projectId}/addons` : 'api/admin/addons';
