'use strict';

const joi = require('joi');

const strategySchema = joi.object().keys({
    name: joi.string()
        .regex(/^[a-zA-Z0-9\\.\\-]{3,30}$/)
        .required(),
    description: joi.string(),
    parameters: joi.array()
        .required()
        .items(joi.object().keys({
            name: joi.string().required(),
            type: joi.string().required(),
            description: joi.string(),
            required: joi.boolean(),
        })),
});

module.exports = strategySchema;
