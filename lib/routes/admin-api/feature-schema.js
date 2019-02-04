'use strict';

const joi = require('joi');
const { nameType } = require('./util');

const nameSchema = joi.object().keys({ name: nameType });

const strategiesSchema = joi.object().keys({
    name: nameType,
    parameters: joi.object(),
});

const variantsSchema = joi.object().keys({
    name: nameType,
    weight: joi
        .number()
        .min(0)
        .max(100)
        .required(),
    payload: joi
        .object()
        .keys({
            type: joi.string().required(),
            value: joi.string().required(),
        })
        .optional(),
    overrides: joi.array().items(
        joi
            .object()
            .keys({
                contextName: joi.string().required(),
                values: joi.array().items(joi.string()),
            })
            .optional()
    ),
});

const featureShema = joi
    .object()
    .keys({
        name: nameType,
        enabled: joi.boolean().default(false),
        description: joi.string(),
        strategies: joi
            .array()
            .required()
            .min(1)
            .items(strategiesSchema),
        variants: joi
            .array()
            .unique((a, b) => a.name === b.name)
            .optional()
            .items(variantsSchema),
    })
    .options({ allowUnknown: false, stripUnknown: true });

module.exports = { featureShema, strategiesSchema, nameSchema };
