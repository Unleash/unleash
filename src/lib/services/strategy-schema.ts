const joi = require('joi');
const { nameType } = require('../routes/util');

const strategySchema = joi
    .object()
    .keys({
        name: nameType,
        editable: joi.boolean().default(true),
        deprecated: joi.boolean().default(false),
        description: joi.string().allow(null).allow('').optional(),
        parameters: joi
            .array()
            .required()
            .items(
                joi.object().keys({
                    name: joi.string().required(),
                    type: joi.string().required(),
                    description: joi.string().allow(null).allow('').optional(),
                    required: joi.boolean(),
                }),
            ),
    })
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
export default strategySchema;
module.exports = strategySchema;
