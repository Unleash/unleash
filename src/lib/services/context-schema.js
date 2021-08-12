'use strict';

const joi = require('joi');
const { nameType } = require('../routes/util');

const nameSchema = joi.object().keys({ name: nameType });

const contextSchema = joi
    .object()
    .keys({
        name: nameType,
        description: joi.string().max(250).allow('').allow(null).optional(),
        legalValues: joi
            .array()
            .allow(null)
            .unique()
            .optional()
            .items(joi.string().max(100)),
        stickiness: joi.boolean().optional().default(false),
    })
    .options({ allowUnknown: false, stripUnknown: true });

module.exports = { contextSchema, nameSchema };
