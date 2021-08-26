import Joi from 'joi';
import { customJoi } from '../routes/util';

export const tagTypeSchema = Joi.object()
    .keys({
        name: customJoi.isUrlFriendly().min(2).max(50).required(),
        description: Joi.string().allow(''),
        icon: Joi.string().allow(null).allow(''),
    })
    .options({
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false,
    });

module.exports = { tagTypeSchema };
