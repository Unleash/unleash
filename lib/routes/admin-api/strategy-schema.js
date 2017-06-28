'use strict';

const joi = require('joi');

const strategySchema = joi.object().keys({
    name: joi.string().regex(/^[a-zA-Z0-9\\.\\-]{3,100}$/).required(),
    editable: joi.boolean().default(true),
    description: joi.string(),
    parameters: joi.array().required().items(
        joi.object().keys({
            name: joi.string().required(),
            type: joi.string().required(),
            description: joi.string().allow(''),
            required: joi.boolean(),
        })
    ),
});

module.exports = strategySchema;
