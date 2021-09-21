import joi from 'joi';
import { ALL, ApiTokenType } from '../types/models/api-token';
import { DEFAULT_ENV } from '../util/constants';

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
        environment: joi.when('type', {
            is: joi.string().valid(ApiTokenType.CLIENT),
            then: joi.string().optional().default(DEFAULT_ENV),
            otherwise: joi.string().optional().default(ALL),
        }),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
