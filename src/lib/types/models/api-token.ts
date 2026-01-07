import BadDataError from '../../error/bad-data-error.js';
import type { IApiTokenCreate } from '../model.js';
import { ApiTokenType } from '../model.js';

export const ALL = '*';

export const isAllProjects = (projects: string[]): boolean => {
    return projects && projects.length === 1 && projects[0] === ALL;
};

export const resolveValidProjects = (projects: string[]): string[] => {
    if (projects.includes('*')) {
        return ['*'];
    }

    return projects;
};

export const validateApiToken = ({
    type,
    projects,
    environment,
}: Omit<IApiTokenCreate, 'secret'>): void => {
    if (type === ApiTokenType.ADMIN && !isAllProjects(projects)) {
        throw new BadDataError(
            'Admin token cannot be scoped to single project',
        );
    }

    if (type === ApiTokenType.ADMIN && environment !== ALL) {
        throw new BadDataError(
            'Admin token cannot be scoped to single environment',
        );
    }

    if (
        (type === ApiTokenType.BACKEND || type === ApiTokenType.CLIENT) &&
        environment === ALL
    ) {
        throw new BadDataError(
            'Client token cannot be scoped to all environments',
        );
    }

    if (type === ApiTokenType.FRONTEND && environment === ALL) {
        throw new BadDataError(
            'Frontend token cannot be scoped to all environments',
        );
    }
};
