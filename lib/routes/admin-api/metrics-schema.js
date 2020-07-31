'use strict';

const joi = require('joi');
const { nameType } = require('./util');

const applicationSchema = joi
    .object()
    .options({ stripUnknown: false })
    .keys({
        appName: nameType,
        sdkVersion: joi.string().optional(),
        strategies: joi
            .array()
            .optional()
            .items(joi.string(), joi.any().strip()),
        description: joi
            .string()
            .allow('')
            .optional(),
        url: joi
            .string()
            .allow('')
            .optional(),
        color: joi
            .string()
            .allow('')
            .optional(),
        icon: joi
            .string()
            .allow('')
            .optional(),
    });

module.exports = applicationSchema;
