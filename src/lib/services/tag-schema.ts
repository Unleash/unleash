import Joi from 'joi';

import { customJoi } from '../routes/util';

export const TAG_MIN_LENGTH = 2;
export const TAG_MAX_LENGTH = 50;
export const tagSchema = Joi.object()
    .keys({
        value: Joi.string().min(TAG_MIN_LENGTH).max(TAG_MAX_LENGTH),
        type: customJoi
            .isUrlFriendly()
            .min(TAG_MIN_LENGTH)
            .max(TAG_MAX_LENGTH)
            .default('simple'),
    })
    .options({
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false,
    });

module.exports = { tagSchema };
