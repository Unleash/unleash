import joi from 'joi';
import { ALL } from '../types/models/api-token.js';
import { ApiTokenType } from '../types/model.js';
import { DEFAULT_ENV } from '../util/constants.js';

export const createApiToken = joi
    .object()
    .keys({
        tokenName: joi.string().optional(),
        type: joi
            .string()
            .lowercase()
            .required()
            .valid(ApiTokenType.CLIENT, ApiTokenType.FRONTEND),
        expiresAt: joi.date().optional(),
        projects: joi.array().min(1).optional().default([ALL]),
        environment: joi.when('type', {
            is: joi.string().valid(ApiTokenType.CLIENT, ApiTokenType.FRONTEND),
            then: joi.string().optional().default(DEFAULT_ENV),
            otherwise: joi.string().optional().default(ALL),
        }),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
