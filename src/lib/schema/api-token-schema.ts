import joi from 'joi';
import { ALL } from '../types/models/api-token.js';
import { ApiTokenType } from '../types/model.js';

export const createApiToken = joi
    .object()
    .keys({
        tokenName: joi.string().required(),
        type: joi
            .string()
            .lowercase()
            .required()
            .valid(
                ApiTokenType.CLIENT,
                ApiTokenType.BACKEND,
                ApiTokenType.FRONTEND,
            ),
        expiresAt: joi.date().optional(),
        projects: joi.array().min(1).optional().default([ALL]),
        environment: joi.string().optional().default('development'),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
