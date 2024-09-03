export const parseToken = (
    token?: string,
): { project: string; environment: string; secret: string } | null => {
    if (!token) return null;

    const [project, rest] = token.split(':', 2);
    if (!rest) return null;

    const [environment, secret, ...extra] = rest.split('.');

    if (project && environment && secret && extra.length === 0) {
        return {
            project,
            environment,
            secret,
        };
    }

    return null;
};
