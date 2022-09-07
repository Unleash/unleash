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
            .valid(
                ApiTokenType.ADMIN,
                ApiTokenType.CLIENT,
                ApiTokenType.FRONTEND,
            ),
        expiresAt: joi.date().optional(),
        project: joi.when('projects', {
            not: joi.required(),
            then: joi.string().optional().default(ALL),
        }),
        projects: joi.array().min(0).optional(),
        environment: joi.when('type', {
            is: joi.string().valid(ApiTokenType.CLIENT, ApiTokenType.FRONTEND),
            then: joi.string().optional().default(DEFAULT_ENV),
            otherwise: joi.string().optional().default(ALL),
        }),
    })
    .nand('project', 'projects')
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
