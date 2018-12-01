'use strict';

const joi = require('joi');

const strategiesSchema = joi.object().keys({
    name: joi
        .string()
        .regex(/^[a-zA-Z0-9\\.\\-]{3,100}$/)
        .required(),
    parameters: joi.object(),
});

const featureShema = joi
    .object()
    .keys({
        name: joi
            .string()
            .regex(/^[a-zA-Z0-9\\.\\-]{3,100}$/)
            .required(),
        enabled: joi.boolean().default(false),
        description: joi.string(),
        strategies: joi
            .array()
            .required()
            .min(1)
            .items(strategiesSchema),
    })
    .options({ allowUnknown: false, stripUnknown: true });

module.exports = { featureShema, strategiesSchema };
