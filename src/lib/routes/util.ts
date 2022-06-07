import joi from 'joi';
import { Response } from 'express';
import { Logger } from '../logger';
import BaseError from '../error/base-error';

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

    if (error instanceof BaseError) {
        return res.status(error.statusCode).json(error).end();
    }

    switch (error.name) {
        case 'ValidationError':
            return res.status(400).json(error).end();
        case 'BadDataError':
            return res.status(400).json(error).end();
        case 'OwaspValidationError':
            return res.status(400).json(error).end();
        case 'PasswordUndefinedError':
            return res.status(400).json(error).end();
        case 'MinimumOneEnvironmentError':
            return res.status(400).json(error).end();
        case 'InvalidTokenError':
            return res.status(401).json(error).end();
        case 'NoAccessError':
            return res.status(403).json(error).end();
        case 'UsedTokenError':
            return res.status(403).json(error).end();
        case 'InvalidOperationError':
            return res.status(403).json(error).end();
        case 'IncompatibleProjectError':
            return res.status(403).json(error).end();
        case 'OperationDeniedError':
            return res.status(403).json(error).end();
        case 'NotFoundError':
            return res.status(404).json(error).end();
        case 'NameExistsError':
            return res.status(409).json(error).end();
        case 'FeatureHasTagError':
            return res.status(409).json(error).end();
        case 'RoleInUseError':
            return res.status(400).json(error).end();
        case 'ProjectWithoutOwnerError':
            return res.status(409).json(error).end();
        default:
            logger.error('Server failed executing request', error);
            return res.status(500).end();
    }
};
