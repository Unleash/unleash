import BadDataError from '../../error/bad-data-error';
import { IEnvironment } from '../model';

export const ALL = '*';

export enum ApiTokenType {
    CLIENT = 'client',
    ADMIN = 'admin',
    PROXY = 'proxy',
}

export interface ILegacyApiTokenCreate {
    secret: string;
    username: string;
    type: ApiTokenType;
    environment?: string;
    environments?: string[];
    project?: string;
    projects?: string[];
    expiresAt?: Date;
}

export interface IApiTokenCreate {
    secret: string;
    username: string;
    type: ApiTokenType;
    environments: string[];
    projects: string[];
    expiresAt?: Date;
}

export interface IApiToken extends IApiTokenCreate {
    createdAt: Date;
    seenAt?: Date;
    environment: string;
    project: string;
}

export const isAll = (values: string[]): boolean => {
    return values && values.length === 1 && values[0] === ALL;
};

export const mapLegacy = (
    error: string,
    value?: string,
    values?: string[],
): string[] => {
    let cleanedValues;
    if (value) {
        cleanedValues = [value];
    } else if (values) {
        cleanedValues = values;
        if (cleanedValues.includes('*')) {
            cleanedValues = ['*'];
        }
    } else {
        throw new BadDataError(
            'API tokens must either contain an environment or environments field',
        );
    }
    return cleanedValues;
};

export const mapLegacyToken = (
    token: Omit<ILegacyApiTokenCreate, 'secret'>,
): Omit<IApiTokenCreate, 'secret'> => {
    const cleanedProjects = mapLegacy(
        'API tokens must either contain a project or projects field',
        token.project,
        token.projects,
    );
    const cleanedEnvironments = mapLegacy(
        'API tokens must either contain an environment or environments field',
        token.environment,
        token.environments,
    );
    return {
        username: token.username,
        type: token.type,
        environments: cleanedEnvironments,
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
    environments,
}: Omit<IApiTokenCreate, 'secret'>): void => {
    if (type === ApiTokenType.ADMIN && !isAll(projects)) {
        throw new BadDataError(
            'Admin token cannot be scoped to single project',
        );
    }

    if (type === ApiTokenType.ADMIN && !isAll(environments)) {
        throw new BadDataError(
            'Admin token cannot be scoped to single environment',
        );
    }

    if (type === ApiTokenType.CLIENT && isAll(environments)) {
        throw new BadDataError(
            'Client token cannot be scoped to all environments',
        );
    }

    if (type === ApiTokenType.PROXY && isAll(environments)) {
        throw new BadDataError(
            'Proxy token cannot be scoped to all environments',
        );
    }
};

export const validateApiTokenEnvironment = (
    { environments }: Pick<IApiTokenCreate, 'environments'>,
    allEnvironments: IEnvironment[],
): void => {
    if (isAll(environments)) {
        return;
    }

    const foundEnvironments = allEnvironments.filter((environment) =>
        environments.includes(environment.name),
    );

    if (foundEnvironments.length !== environments.length) {
        throw new BadDataError('One or more environments do not exist');
    }

    if (
        foundEnvironments.filter((environment) => !environment.enabled).length
    ) {
        throw new BadDataError(
            'Token cannot be scoped to disabled environments',
        );
    }
};
