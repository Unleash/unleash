const joi = require('joi');
const { nameType } = require('../routes/admin-api/util');

const addonSchema = joi
    .object()
    .keys({
        provider: nameType,
        enabled: joi.bool().default(true),
        description: joi
            .string()
            .allow(null)
            .allow('')
            .optional(),
        parameters: joi
            .object()
            .pattern(joi.string(), [joi.string(), joi.number(), joi.boolean()])
            .optional(),
        events: joi
            .array()
            .optional()
            .items(joi.string()),
    })
    .options({ allowUnknown: false, stripUnknown: true });

module.exports = {
    addonSchema,
};
