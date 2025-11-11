import joi from 'joi';
import type { Response } from 'express';
import type { Logger } from '../logger.js';
import { UnleashError } from '../error/unleash-error.js';
import { fromLegacyError } from '../error/from-legacy-error.js';
import createError from 'http-errors';

export const customJoi = joi.extend((j) => ({
    type: 'isUrlFriendly',
    base: j.string(),
    messages: {
        'isUrlFriendly.base': '{{#label}} must be URL friendly',
    },
    validate(value, helpers) {
        // Base validation regardless of the rules applied
        if (
            encodeURIComponent(value) !== value ||
            value === '..' ||
            value === '.'
        ) {
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
        const httpError = error as createError.HttpError & {
            errors?: Array<Record<string, unknown>>;
        };
        const payload: Record<string, unknown> = { message: httpError.message };
        if (httpError.errors) {
            payload.details = httpError.errors;
        }
        return res.status(httpError.status ?? 400).json(payload);
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

    // details property behaves weirdly. Trying to access it as finalError.details[0],
    // hangs the execution of this method. Returning it as finalError.details doesn't
    // work returning undefined. Printing out the finalError object using JSON.stringify
    // shows that the details property is there and is an array.
    // Running JSON.stringify(finalError.details) also hangs.
    // As a workaround, we do a roundabout way of getting to the details property
    // by doing JSON.parse(JSON.stringify(finalError))['details']
    const validationDetails =
        JSON.parse(JSON.stringify(finalError)).details ??
        JSON.parse(JSON.stringify(error)).validationErrors;
    return res
        .status(finalError.statusCode)
        .json({
            name: finalError.name,
            message: finalError.message,
            details: validationDetails,
        })
        .end();
};
