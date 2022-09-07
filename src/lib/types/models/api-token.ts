import BadDataError from '../../error/bad-data-error';
import { IEnvironment } from '../model';

export const ALL = '*';

export enum ApiTokenType {
    CLIENT = 'client',
    ADMIN = 'admin',
    FRONTEND = 'frontend',
}

export interface ILegacyApiTokenCreate {
    secret: string;
    username: string;
    type: ApiTokenType;
    environment: string;
    project?: string;
    projects?: string[];
    expiresAt?: Date;
}

export interface IApiTokenCreate {
    secret: string;
    username: string;
    alias?: string;
    type: ApiTokenType;
    environment: string;
    projects: string[];
    expiresAt?: Date;
}

export interface IApiToken extends IApiTokenCreate {
    createdAt: Date;
    seenAt?: Date;
    environment: string;
    project: string;
    alias: string | null;
}

export const isAllProjects = (projects: string[]): boolean => {
    return projects && projects.length === 1 && projects[0] === ALL;
};

export const mapLegacyProjects = (
    project?: string,
    projects?: string[],
): string[] => {
    let cleanedProjects;
    if (project) {
        cleanedProjects = [project];
    } else if (projects) {
        cleanedProjects = projects;
        if (cleanedProjects.includes('*')) {
            cleanedProjects = ['*'];
        }
    } else {
        throw new BadDataError(
            'API tokens must either contain a project or projects field',
        );
    }
    return cleanedProjects;
};

export const mapLegacyToken = (
    token: Omit<ILegacyApiTokenCreate, 'secret'>,
): Omit<IApiTokenCreate, 'secret'> => {
    const cleanedProjects = mapLegacyProjects(token.project, token.projects);
    return {
        username: token.username,
        type: token.type,
        environment: token.environment,
        projects: cleanedProjects,
        expiresAt: token.expiresAt,
    };
};

export const mapLegacyTokenWithSecret = (
    token: ILegacyApiTokenCreate,
): IApiTokenCreate => {
    return {
        ...mapLegacyToken(token),
        secret: token.secret,
    };
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

    if (type === ApiTokenType.CLIENT && environment === ALL) {
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

export const validateApiTokenEnvironment = (
    { environment }: Pick<IApiTokenCreate, 'environment'>,
    environments: IEnvironment[],
): void => {
    if (environment === ALL) {
        return;
    }

    const selectedEnvironment = environments.find(
        (env) => env.name === environment,
    );

    if (!selectedEnvironment) {
        throw new BadDataError(`Environment=${environment} does not exist`);
    }

    if (!selectedEnvironment.enabled) {
        throw new BadDataError(
            'Client token cannot be scoped to disabled environments',
        );
    }
};
