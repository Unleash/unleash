'use strict';

const joi = require('@hapi/joi');
const { nameType } = require('./util');

const strategySchema = joi.object().keys({
    name: nameType,
    editable: joi.boolean().default(true),
    description: joi
        .string()
        .allow(null)
        .allow('')
        .optional(),
    parameters: joi
        .array()
        .required()
        .items(
            joi.object().keys({
                name: joi.string().required(),
                type: joi.string().required(),
                description: joi
                    .string()
                    .allow(null)
                    .allow('')
                    .optional(),
                required: joi.boolean(),
            }),
        ),
});

module.exports = strategySchema;
