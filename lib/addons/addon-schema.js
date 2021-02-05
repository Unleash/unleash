const joi = require('joi');
const { nameType } = require('../routes/admin-api/util');
const { tagTypeSchema } = require('../services/tag-type-schema');

const addonDefinitionSchema = joi.object().keys({
    name: nameType,
    displayName: joi.string(),
    documentationUrl: joi.string().uri({ scheme: [/https?/] }),
    description: joi.string().allow(''),
    parameters: joi
        .array()
        .optional()
        .items(
            joi.object().keys({
                name: joi.string().required(),
                displayName: joi.string().required(),
                type: joi.string().required(),
                description: joi.string(),
                placeholder: joi.string().allow(''),
                required: joi.boolean().default(false),
                sensitive: joi.boolean().default(false),
            }),
        ),
    events: joi
        .array()
        .optional()
        .items(joi.string()),
    tagTypes: joi
        .array()
        .optional()
        .items(tagTypeSchema),
});

module.exports = {
    addonDefinitionSchema,
};
