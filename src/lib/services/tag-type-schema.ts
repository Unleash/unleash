import Joi from 'joi';
import { customJoi } from '../routes/util.js';

export const tagTypeSchema = Joi.object()
    .keys({
        name: customJoi.isUrlFriendly().min(2).max(50).required(),
        description: Joi.string().allow(''),
        icon: Joi.string().allow(null).allow(''),
        color: Joi.string()
            .pattern(/^#[0-9A-Fa-f]{6}$/)
            .allow(null)
            .allow(''),
    })
    .options({
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false,
    });
