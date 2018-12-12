'use strict';

const joi = require('joi');
const { nameType } = require('./util');

const nameSchema = joi.object().keys({ name: nameType });

const strategiesSchema = joi.object().keys({
    name: nameType,
    parameters: joi.object(),
});

const featureShema = joi
    .object()
    .keys({
        name: nameType,
        enabled: joi.boolean().default(false),
        description: joi.string(),
        strategies: joi
            .array()
            .required()
            .min(1)
            .items(strategiesSchema),
    })
    .options({ allowUnknown: false, stripUnknown: true });

module.exports = { featureShema, strategiesSchema, nameSchema };
