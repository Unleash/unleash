import joi from 'joi';
import { ALL_OPERATORS } from '../util/constants';
import { nameType } from '../routes/util';

export const nameSchema = joi
    .object()
    .keys({ name: nameType })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });

export const constraintSchema = joi.object().keys({
    contextName: joi.string().required(),
    operator: joi
        .string()
        .valid(...ALL_OPERATORS)
        .required(),
    // Constraints must have a values array to support legacy SDKs.
    values: joi.array().items(joi.string().min(1).max(100)).default([]),
    value: joi.optional(),
    caseInsensitive: joi.boolean().optional(),
    inverted: joi.boolean().optional(),
});

export const strategiesSchema = joi.object().keys({
    id: joi.string().optional(),
    name: nameType,
    constraints: joi.array().allow(null).items(constraintSchema),
    parameters: joi.object(),
});

export const variantsSchema = joi.object().keys({
    name: nameType,
    weight: joi.number().min(0).max(1000).required(),
    weightType: joi.string().valid('variable', 'fix').default('variable'),
    payload: joi
        .object()
        .keys({
            type: joi.string().required(),
            value: joi.string().required(),
        })
        .optional(),
    stickiness: joi.string().default('default'),
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

export const variantsArraySchema = joi
    .array()
    .min(0)
    .items(variantsSchema)
    .unique((a, b) => a.name === b.name);

export const featureMetadataSchema = joi
    .object()
    .keys({
        name: nameType,
        stale: joi.boolean().default(false),
        archived: joi.boolean().default(false),
        type: joi.string().default('release'),
        description: joi.string().allow('').allow(null).optional(),
        impressionData: joi
            .boolean()
            .allow(true)
            .allow(false)
            .default(false)
            .optional(),
        createdAt: joi.date().optional().allow(null),
    })
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const featureSchema = joi
    .object()
    .keys({
        name: nameType,
        enabled: joi.boolean().default(false),
        stale: joi.boolean().default(false),
        archived: joi.boolean().default(false),
        type: joi.string().default('release'),
        project: joi.string().default('default'),
        description: joi.string().allow('').allow(null).optional(),
        impressionData: joi
            .boolean()
            .allow(true)
            .allow(false)
            .default(false)
            .optional(),
        strategies: joi
            .array()
            .min(0)
            .allow(null)
            .optional()
            .items(strategiesSchema),
        variants: joi
            .array()
            .allow(null)
            .unique((a, b) => a.name === b.name)
            .optional()
            .items(variantsSchema),
    })
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const querySchema = joi
    .object()
    .keys({
        tag: joi
            .array()
            .allow(null)
            .items(joi.string().pattern(/\w+:.+/, { name: 'tag' }))
            .optional(),
        project: joi.array().allow(null).items(nameType).optional(),
        namePrefix: joi.string().allow(null).optional(),
        environment: joi.string().allow(null).optional(),
    })
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const featureTagSchema = joi.object().keys({
    featureName: nameType,
    tagType: nameType.optional(),
    tagValue: joi.string(),
    type: nameType.optional(),
    value: joi.string().optional(),
});
