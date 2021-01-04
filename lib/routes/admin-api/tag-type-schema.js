'use strict';

const joi = require('joi');
const { customJoi } = require('./util');

const tagTypeSchema = joi
    .object()
    .keys({
        name: customJoi
            .isUrlFriendly()
            .min(2)
            .max(50)
            .required(),
        description: joi.string().allow(''),
        icon: joi.string().allow(''),
    })
    .options({
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false,
    });

module.exports = { tagTypeSchema };
