import { fromJoiError } from './bad-data-error.js';
import pkg from 'joi';
const { ValidationError: JoiValidationError } = pkg;
import {
    GenericUnleashError,
    type UnleashApiErrorName,
    UnleashApiErrorTypes,
    UnleashError,
} from './unleash-error.js';

const getStatusCode = (errorName: string): number => {
    switch (errorName) {
        case 'ContentTypeError':
            return 415;
        case 'ValidationError':
            return 400;
        case 'BadDataError':
            return 400;
        case 'OwaspValidationError':
            return 400;
        case 'PasswordUndefinedError':
            return 400;
        case 'InvalidTokenError':
            return 401;
        case 'UsedTokenError':
            return 403;
        case 'InvalidOperationError':
            return 403;
        case 'IncompatibleProjectError':
            return 403;
        case 'OperationDeniedError':
            return 403;
        case 'NotFoundError':
            return 404;
        case 'NameExistsError':
            return 409;
        case 'FeatureHasTagError':
            return 409;
        case 'RoleInUseError':
            return 400;
        case 'ProjectWithoutOwnerError':
            return 409;
        case 'UnknownError':
            return 500;
        case 'InternalError':
            return 500;
        case 'PasswordMismatch':
            return 401;
        case 'UnauthorizedError':
            return 401;
        case 'DisabledError':
            return 422;
        case 'NotImplementedError':
            return 405;
        case 'NoAccessError':
            return 403;
        case 'AuthenticationRequired':
            return 401;
        case 'ForbiddenError':
            return 403;
        case 'PermissionError':
            return 403;
        case 'BadRequestError': //thrown by express; do not remove
            return 400;
        default:
            return 500;
    }
};

export const fromLegacyError = (e: Error): UnleashError => {
    if (e instanceof UnleashError) {
        return e;
    }
    const name = UnleashApiErrorTypes.includes(e.name as UnleashApiErrorName)
        ? (e.name as UnleashApiErrorName)
        : 'UnknownError';

    const statusCode = getStatusCode(name);

    if (name === 'NoAccessError') {
        return new GenericUnleashError({
            name: 'NoAccessError',
            message: e.message,
            statusCode,
        });
    }

    if (e instanceof JoiValidationError) {
        return fromJoiError(e);
    }

    if (name === 'ValidationError' || name === 'BadDataError') {
        return new GenericUnleashError({
            name: 'BadDataError',
            message: e.message,
            statusCode,
        });
    }

    if (name === 'OwaspValidationError') {
        return new GenericUnleashError({
            name: 'OwaspValidationError',
            message: e.message,
            statusCode,
        });
    }

    if (name === 'AuthenticationRequired') {
        return new GenericUnleashError({
            name: 'AuthenticationRequired',
            message: `You must be authenticated to view this content. Please log in.`,
            statusCode,
        });
    }

    return new GenericUnleashError({
        name: name as UnleashApiErrorName,
        message: e.message,
        statusCode,
    });
};
