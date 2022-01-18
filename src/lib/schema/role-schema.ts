import joi from 'joi';

export const permissionRoleSchema = joi
    .object()
    .keys({
        id: joi.number().required(),
        environment: joi.string().optional().allow('').allow(null).default(''),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });

export const roleSchema = joi
    .object()
    .keys({
        name: joi.string().required(),
        description: joi.string().optional().allow('').allow(null).default(''),
        permissions: joi
            .array()
            .allow(null)
            .optional()
            .items(permissionRoleSchema),
    })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
