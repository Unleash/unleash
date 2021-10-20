export const getTogglePath = (projectId: string, featureToggleName: string, newPath: boolean) => {
    return `/projects/${projectId}/features${newPath ? `2/${featureToggleName}` : `/${featureToggleName}/strategies`}`;
};

export const getToggleCopyPath = (
    projectId: string,
    featureToggleName: string
) => {
    return `/projects/${projectId}/features/${featureToggleName}/strategies/copy`;
};

export const getCreateTogglePath = (
    projectId: string,
    newPath: boolean = false,
    query?: Object
) => {
    const path = newPath
        ? `/projects/${projectId}/create-toggle2`
        : `/projects/${projectId}/create-toggle`;

    let queryString;
    if (query) {
        queryString = Object.keys(query).reduce((acc, curr) => {
            acc += `${curr}=${query[curr]}`;
            return acc;
        }, '');
    }
    if (queryString) {
        return `${path}?${queryString}`;
    }
    return path;
};

export const getProjectEditPath = (projectId: string) => {
    return `/projects/${projectId}/edit`;
};
