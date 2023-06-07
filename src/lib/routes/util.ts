import joi from 'joi';
import { Response } from 'express';
import { Logger } from '../logger';
import { UnleashError } from '../error/unleash-error';
import { fromLegacyError } from '../error/from-legacy-error';

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
        logger.debug(
            `I encountered an error that wasn't an instance of the \`UnleashError\` type. The original error was:`,
            error,
            'It was mapped to:',
            finalError.toJSON(),
        );
    }

    logger.warn(
        `Error message: "${finalError.message}" Error ID: "${finalError.id}". Full, serialized error:`,
        finalError.toJSON(),
    );

    if (['InternalError', 'UnknownError'].includes(finalError.name)) {
        logger.error('Server failed executing request', error);
    }

    return res.status(finalError.statusCode).json(finalError).end();
};
