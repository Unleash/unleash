import { fromJoiError } from './bad-data-error';
import { ValidationError as JoiValidationError } from 'joi';
import {
    GenericUnleashError,
    UnleashApiErrorName,
    UnleashApiErrorTypes,
    UnleashError,
} from './unleash-error';

export const fromLegacyError = (e: Error): UnleashError => {
    if (e instanceof UnleashError) {
        return e;
    }
    const name = UnleashApiErrorTypes.includes(e.name as UnleashApiErrorName)
        ? (e.name as UnleashApiErrorName)
        : 'UnknownError';

    if (name === 'NoAccessError') {
        return new GenericUnleashError({
            name: 'NoAccessError',
            message: e.message,
        });
    }

    if (e instanceof JoiValidationError) {
        return fromJoiError(e);
    }

    if (name === 'ValidationError' || name === 'BadDataError') {
        return new GenericUnleashError({
            name: 'BadDataError',
            message: e.message,
        });
    }

    if (name === 'OwaspValidationError') {
        return new GenericUnleashError({
            name: 'OwaspValidationError',
            message: e.message,
        });
    }

    if (name === 'AuthenticationRequired') {
        return new GenericUnleashError({
            name: 'AuthenticationRequired',
            message: `You must be authenticated to view this content. Please log in.`,
        });
    }

    return new GenericUnleashError({
        name: name as UnleashApiErrorName,
        message: e.message,
    });
};
