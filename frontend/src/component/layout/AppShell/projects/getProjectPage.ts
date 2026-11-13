export type ProjectPage = 'flags' | 'change-requests' | 'logs' | 'settings';

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
        case 'logs':
        case 'settings':
            return segment;
        case 'applications':
            return undefined;
        default:
            // Project.tsx renders flags for any unmatched sub-route, e.g. features/:featureId
            return 'flags';
    }
};
