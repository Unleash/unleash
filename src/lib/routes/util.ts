import joi from 'joi';
import type { Response } from 'express';
import type { Logger } from '../logger';
import { UnleashError } from '../error/unleash-error';
import { fromLegacyError } from '../error/from-legacy-error';
import createError from 'http-errors';

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
    if (createError.isHttpError(error)) {
        return res
            .status(
                // @ts-expect-error - The error object here is not guaranteed to contain status
                error.status ?? 400,
            )
            .json({ message: error.message });
    }

    const finalError =
        error instanceof UnleashError ? error : fromLegacyError(error);

    const format = (thing: object) => JSON.stringify(thing, null, 2);

    if (!(error instanceof UnleashError)) {
        logger.debug(
            `I encountered an error that wasn't an instance of the \`UnleashError\` type. The original error was: ${format(
                error,
            )}. It was mapped to ${format(finalError.toJSON())}`,
        );
    }

    if (finalError.statusCode === 500) {
        logger.error(
            `Server failed executing request: ${format(error)}`,
            error,
        );
    }

    return res.status(finalError.statusCode).json(finalError).end();
};
