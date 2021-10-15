export const getTogglePath = (projectId: string, featureToggleName: string, newPath: boolean) => {
    return `/projects/${projectId}/features${newPath ? `2/${featureToggleName}` : `/${featureToggleName}/strategies`}`;
};

export const getToggleCopyPath = (
    projectId: string,
    featureToggleName: string
) => {
    return `/projects/${projectId}/features/${featureToggleName}/strategies/copy`;
};

export const getCreateTogglePath = (projectId: string) => {
    return `/projects/${projectId}/create-toggle?project=${projectId}`;
};

export const getProjectEditPath = (projectId: string) => {
    return `/projects/${projectId}/edit`;
};
