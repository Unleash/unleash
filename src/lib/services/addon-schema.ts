import joi from 'joi';
import { nameType } from '../routes/util';

export const addonSchema = joi
    .object()
    .keys({
        provider: nameType,
        enabled: joi.bool().default(true),
        description: joi.string().allow(null).allow('').optional(),
        parameters: joi
            .object()
            .pattern(joi.string(), [joi.string(), joi.number(), joi.boolean()])
            .optional(),
        events: joi.array().optional().items(joi.string()),
        projects: joi.array().optional().items(joi.string()),
        environments: joi.array().optional().items(joi.string()),
    })
    .options({ allowUnknown: false, stripUnknown: true });
