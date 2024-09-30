export const getTogglePath = (projectId: string, featureToggleName: string) => {
    return `/projects/${projectId}/features/${featureToggleName}`;
};

export const getCreateTogglePath = (
    projectId: string,
    query?: Record<string, string>,
) => {
    const path = `/projects/${projectId}?create=true`;

    let queryString: string | undefined;
    if (query) {
        queryString = Object.keys(query).reduce((acc, curr) => {
            return `${acc}${curr}=${query[curr]}`;
        }, '');
    }

    if (queryString) {
        return `${path}&${queryString}`;
    }

    return path;
};
