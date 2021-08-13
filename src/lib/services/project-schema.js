const joi = require('joi');
const { nameType } = require('../routes/util');

const projectSchema = joi
    .object()
    .keys({
        id: nameType,
        name: joi.string().required(),
        description: joi.string().allow(null).allow('').optional(),
    })
    .options({ allowUnknown: false, stripUnknown: true });

module.exports = projectSchema;
