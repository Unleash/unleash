import joi from 'joi';
import { ApiTokenType } from '../types/model.js';
import { DEFAULT_ENV } from '../util/constants.js';

export const createProjectApiToken = joi
    .object()
    .keys({
        tokenName: joi.string().required(),
        type: joi
            .string()
            .lowercase()
            .required()
            .valid(ApiTokenType.CLIENT, ApiTokenType.FRONTEND),
        expiresAt: joi.date().optional(),
        environment: joi.when('type', {
            is: joi.string().valid(ApiTokenType.CLIENT, ApiTokenType.FRONTEND),
            then: joi.string().optional().default(DEFAULT_ENV),
        }),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
