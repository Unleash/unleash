import joi from 'joi';
import { Response } from 'express';
import { Logger } from '../logger';
import { fromLegacyError, UnleashError } from '../error/api-error';

export const customJoi = joi.extend((j) => ({
    type: 'isUrlFriendly',
    base: j.string(),
    messages: {
        'isUrlFriendly.base': '{{#label}} must be URL friendly',
    },
    validate(value, helpers) {
        // Base validation regardless of the rules applied
        if (encodeURIComponent(value) !== value) {
            // Generate an error, state and options need to be passed
            return { value, errors: helpers.error('isUrlFriendly.base') };
        }
        return undefined;
    },
}));

export const nameType = customJoi.isUrlFriendly().min(1).max(100).required();

export const handleErrors: (
    res: Response,
    logger: Logger,
    error: Error,
) => void = (res, logger, error) => {
    const finalError =
        error instanceof UnleashError ? error : fromLegacyError(error);

    if (!(error instanceof UnleashError)) {
        logger.warn(
            `I encountered an error that wasn't an instance of the \`UnleashError\` type. This probably means that we had an unexpected crash. The original error and what it was mapped to are:`,
            error,
            finalError,
        );
    }

    logger.warn(finalError.id, finalError.message);

    if (['InternalError', 'UnknownError'].includes(finalError.name)) {
        logger.error('Server failed executing request', error);
    }

    return res.status(finalError.statusCode).json(finalError).end();
};
