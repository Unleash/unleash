'use strict';

const joi = require('joi');
const { nameType } = require('../routes/admin-api/util');

const nameSchema = joi
    .object()
    .keys({ name: nameType })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });

const constraintSchema = joi.object().keys({
    contextName: joi.string(),
    operator: joi.string(),
    values: joi
        .array()
        .items(
            joi
                .string()
                .min(1)
                .max(100),
        )
        .min(1)
        .optional(),
});

const strategiesSchema = joi.object().keys({
    name: nameType,
    constraints: joi
        .array()
        .allow(null)
        .items(constraintSchema),
    parameters: joi.object(),
});

const variantsSchema = joi.object().keys({
    name: nameType,
    weight: joi
        .number()
        .min(0)
        .max(1000)
        .required(),
    weightType: joi
        .string()
        .valid('variable', 'fix')
        .default('variable'),
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
            .optional(),
    ),
});

const featureSchema = joi
    .object()
    .keys({
        name: nameType,
        enabled: joi.boolean().default(false),
        stale: joi.boolean().default(false),
        type: joi.string().default('release'),
        project: joi.string().default('default'),
        description: joi
            .string()
            .allow('')
            .allow(null)
            .optional(),
        strategies: joi
            .array()
            .required()
            .min(1)
            .items(strategiesSchema),
        variants: joi
            .array()
            .allow(null)
            .unique((a, b) => a.name === b.name)
            .optional()
            .items(variantsSchema),
    })
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

const querySchema = joi
    .object()
    .keys({
        tag: joi
            .array()
            .allow(null)
            .items(joi.string().pattern(/\w+:.+/, { name: 'tag' }))
            .optional(),
        project: joi
            .array()
            .allow(null)
            .items(joi.string().alphanum())
            .optional(),
        namePrefix: joi
            .string()
            .allow(null)
            .optional(),
    })
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

module.exports = { featureSchema, strategiesSchema, nameSchema, querySchema };
