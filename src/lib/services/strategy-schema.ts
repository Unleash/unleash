import { nameType } from '../routes/util.js';
import joi from 'joi';

const strategySchema = joi
    .object()
    .keys({
        name: nameType,
        title: joi.string().allow(null).allow('').optional(),
        disabled: joi.boolean().allow(null).optional(),
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
