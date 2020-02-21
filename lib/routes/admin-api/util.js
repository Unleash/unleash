'use strict';

const joi = require('@hapi/joi');

const customJoi = joi.extend(j => ({
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
    },
}));

const nameType = customJoi
    .isUrlFriendly()
    .min(2)
    .max(100)
    .required();

const handleErrors = (res, logger, error) => {
    logger.warn(error.message);
    switch (error.name) {
        case 'NotFoundError':
            return res.status(404).end();
        case 'NameExistsError':
        case 'ValidationError':
            error.isJoi = true;
            return res
                .status(400)
                .json(error)
                .end();
        default:
            logger.error('Server failed executing request', error);
            return res.status(500).end();
    }
};

module.exports = { nameType, handleErrors };
