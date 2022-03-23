import { Store } from 'express-session';
import EnvironmentService from 'lib/services/environment-service';
import BadDataError from '../../error/bad-data-error';
import { IEnvironment } from '../model';

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
