export const getTogglePath = (projectId: string, featureToggleName: string) => {
    return `/projects/${projectId}/features/${featureToggleName}`;
};

export const getCreateTogglePath = (
    projectId: string,
    newPath: boolean = false,
    query?: Object
) => {
    const path = `/projects/${projectId}/create-toggle`;

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
