import joi from 'joi';
import { nameType } from '../routes/util.js';

export const projectSchema = joi
    .object()
    .keys({
        id: nameType,
        name: joi.string().required(),
        description: joi.string().allow(null).allow('').optional(),
        mode: joi
            .string()
            .valid('open', 'protected', 'private')
            .default('open'),
        defaultStickiness: joi.string().default('default'),
        featureLimit: joi.number().allow(null).optional(),
        featureNaming: joi.object().keys({
            pattern: joi.string().allow(null).allow('').optional(),
            example: joi.string().allow(null).allow('').optional(),
            description: joi.string().allow(null).allow('').optional(),
        }),
        environments: joi.array().items(joi.string()),
        changeRequestEnvironments: joi.array().items(
            joi.object({
                name: joi.string(),
                requiredApprovals: joi.number(),
            }),
        ),
    })
    .options({ allowUnknown: false, stripUnknown: true });
