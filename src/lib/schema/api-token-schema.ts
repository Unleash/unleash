import joi from 'joi';
import { ALL, ApiTokenType } from '../types/models/api-token';

export const createApiToken = joi
    .object()
    .keys({
        username: joi.string().required(),
        type: joi
            .string()
            .lowercase()
            .required()
            .valid(ApiTokenType.ADMIN, ApiTokenType.CLIENT),
        expiresAt: joi.date().optional(),
        project: joi.string().optional().default(ALL),
        environment: joi.string().optional().default(ALL),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
