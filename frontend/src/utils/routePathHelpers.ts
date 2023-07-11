import useUiConfig from '../hooks/api/getters/useUiConfig/useUiConfig';

export const getTogglePath = (projectId: string, featureToggleName: string) => {
    return `/projects/${projectId}/features/${featureToggleName}`;
};

export const getCreateTogglePath = (
    projectId: string,
    query?: Record<string, string>
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

export const getProjectEditPath = (
    projectId: string,
    newProjectPath: boolean
) => {
    return newProjectPath
        ? `/projects/${projectId}/settings`
        : `/projects/${projectId}/edit`;
};
