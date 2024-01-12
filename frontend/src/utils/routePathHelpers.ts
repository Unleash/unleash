export const getTogglePath = (projectId: string, featureToggleName: string) => {
    return `/projects/${projectId}/features/${featureToggleName}`;
};

export const getCreateTogglePath = (
    projectId: string,
    query?: Record<string, string>,
) => {
    const path = `/projects/${projectId}/create-toggle`;

    let queryString: string | undefined;
    if (query) {
        queryString = Object.keys(query).reduce((acc, curr) => {
            return `${acc}${curr}=${query[curr]}`;
        }, '');
    }

    if (queryString) {
        return `${path}?${queryString}`;
    }

    return path;
};

export const getProjectEditPath = (projectId: string) => {
    return `/projects/${projectId}/settings`;
};
