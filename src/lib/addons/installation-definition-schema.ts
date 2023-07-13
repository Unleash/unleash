import joi from 'joi';

export const installationDefinitionSchema = joi.object().keys({
    url: joi.string().uri({ scheme: [/https?/] }),
    title: joi.string().optional(),
    helpText: joi.string().optional(),
});
