import Joi from 'joi';

import { customJoi } from '../routes/util.js';
import { TAG_MIN_LENGTH, TAG_MAX_LENGTH } from '../tags/index.js';

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
