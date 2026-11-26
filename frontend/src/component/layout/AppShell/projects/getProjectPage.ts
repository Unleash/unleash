export type ProjectPage =
    | 'flags'
    | 'change-requests'
    | 'applications'
    | 'logs'
    | 'settings';

export const isInProject = (pathname: string, projectId: string) => {
    const base = `/projects/${projectId}`;
    return pathname === base || pathname.startsWith(`${base}/`);
};

export const getProjectPage = (
    pathname: string,
    projectId: string,
): ProjectPage | undefined => {
    if (!isInProject(pathname, projectId)) {
        return undefined;
    }
    const segment = pathname.split('/')[3];
    switch (segment) {
        case 'change-requests':
        case 'applications':
        case 'logs':
        case 'settings':
            return segment;
        default:
            // Project.tsx renders flags for any unmatched sub-route, e.g. features/:featureId
            return 'flags';
    }
};
