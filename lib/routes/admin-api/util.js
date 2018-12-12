'use strict';

const logger = require('../../logger')('/admin-api/util.js');

const joi = require('joi');

const customJoi = joi.extend(j => ({
    base: j.string(),
    name: 'string',
    language: {
        isUrlFriendly: 'must be URL friendly',
    },
    rules: [
        {
            name: 'isUrlFriendly',
            validate(params, value, state, options) {
                if (encodeURIComponent(value) !== value) {
                    // Generate an error, state and options need to be passed
                    return this.createError(
                        'string.isUrlFriendly',
                        { v: value },
                        state,
                        options
                    );
                }
                return value; // Everything is OK
            },
        },
    ],
}));

const nameType = customJoi
    .string()
    .isUrlFriendly()
    .min(2)
    .max(100)
    .required();

const handleErrors = (res, error) => {
    logger.warn(error.message);
    switch (error.name) {
        case 'NotFoundError':
            return res.status(404).end();
        case 'NameExistsError':
            return res
                .status(403)
                .json([{ msg: error.message }])
                .end();
        case 'ValidationError':
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
