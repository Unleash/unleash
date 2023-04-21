import joi from 'joi';
import { Response } from 'express';
import { Logger } from '../logger';
import { fromLegacyError } from '../error/api-error';

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
    logger.warn(error.message);
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    error.isJoi = true;

    const newError = fromLegacyError(error);

    if (['InternalError', 'UnknownError'].includes(newError.name)) {
        logger.error('Server failed executing request', error);
    }

    return res.status(newError.statusCode).json(newError).end();
};
