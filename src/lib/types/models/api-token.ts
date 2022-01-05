import BadDataError from '../../error/bad-data-error';

export const ALL = '*';

export enum ApiTokenType {
    CLIENT = 'client',
    ADMIN = 'admin',
}

export interface IApiTokenCreate {
    secret: string;
    username: string;
    type: ApiTokenType;
    environment: string;
    project: string;
    expiresAt?: Date;
}

export interface IApiToken extends IApiTokenCreate {
    createdAt: Date;
    seenAt?: Date;
    environment: string;
    project: string;
}

export const validateApiToken = ({
    type,
    project,
    environment,
}: Omit<IApiTokenCreate, 'secret'>): void => {
    if (type === ApiTokenType.ADMIN && project !== ALL) {
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
};
