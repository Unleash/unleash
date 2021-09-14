import joi from 'joi';
import { nameType } from '../routes/util';

export const projectSchema = joi
    .object()
    .keys({
        id: nameType,
        name: joi.string().required(),
        description: joi.string().allow(null).allow('').optional(),
    })
    .options({ allowUnknown: false, stripUnknown: true });
