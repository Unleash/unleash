import joi from 'joi';

export const installationDefinitionSchema = joi.object().keys({
    url: joi.string().uri({ scheme: [/https?/] }),
    warning: joi.string().optional(),
    title: joi.string().optional(),
    helpText: joi.string().optional(),
});
