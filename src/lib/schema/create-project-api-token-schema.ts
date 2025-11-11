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
            .valid(
                ApiTokenType.CLIENT,
                ApiTokenType.BACKEND,
                ApiTokenType.FRONTEND,
            ),
        expiresAt: joi.date().optional(),
        environment: joi.when('type', {
            is: joi
                .string()
                .valid(
                    ApiTokenType.CLIENT,
                    ApiTokenType.BACKEND,
                    ApiTokenType.FRONTEND,
                ),
            then: joi.string().optional().default(DEFAULT_ENV),
        }),
        projects: joi.array().items(joi.string()).optional(),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
