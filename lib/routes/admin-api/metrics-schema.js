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
            .required()
            .items(joi.string(), joi.any().strip()),
        description: joi.string().optional(),
        url: joi.string().optional(),
        color: joi.string().optional(),
        icon: joi.string().optional(),
    });

module.exports = applicationSchema;
