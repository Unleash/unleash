import joi from 'joi';

export const installationDefinitionSchema = joi.object().keys({
    url: joi
        .string()
        .optional()
        .uri({ scheme: [/https?/] }),
    warning: joi.string().optional(),
    title: joi.string().optional(),
    text: joi.string().optional(),
});
