import joi from 'joi';
import { nameType } from '../routes/util';

export const projectSchema = joi
    .object()
    .keys({
        id: nameType,
        name: joi.string().required(),
        description: joi.string().allow(null).allow('').optional(),
        mode: joi.string().valid('open', 'protected').default('open'),
        defaultStickiness: joi
            .string()
            .valid('default', 'userId', 'sessionId', 'random')
            .default('default'),
    })
    .options({ allowUnknown: false, stripUnknown: true });
