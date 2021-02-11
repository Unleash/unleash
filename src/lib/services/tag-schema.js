'use strict';

const joi = require('joi');
const { customJoi } = require('../routes/admin-api/util');

const tagSchema = joi
    .object()
    .keys({
        value: joi
            .string()
            .min(2)
            .max(50),
        type: customJoi
            .isUrlFriendly()
            .min(2)
            .max(50)
            .default('simple'),
    })
    .options({
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false,
    });

module.exports = { tagSchema };
