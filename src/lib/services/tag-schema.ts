import Joi from 'joi';

import { customJoi } from '../routes/util';

export const tagSchema = Joi.object()
    .keys({
        value: Joi.string().min(2).max(50),
        type: customJoi.isUrlFriendly().min(2).max(50).default('simple'),
    })
    .options({
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false,
    });

module.exports = { tagSchema };
