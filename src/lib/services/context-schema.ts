import joi from 'joi';
import { nameType } from '../routes/util';

export const nameSchema = joi.object().keys({ name: nameType });

const legalValueSchema = joi.object().keys({
    value: joi.string().min(1).max(100).required(),
    description: joi.string().allow('').allow(null).optional(),
});

export const contextSchema = joi
    .object()
    .keys({
        name: nameType,
        description: joi.string().max(250).allow('').allow(null).optional(),
        legalValues: joi
            .array()
            .allow(null)
            .unique((a, b) => a.value === b.value)
            .optional()
            .items(legalValueSchema),
        stickiness: joi.boolean().optional().default(false),
    })
    .options({ allowUnknown: false, stripUnknown: true });
