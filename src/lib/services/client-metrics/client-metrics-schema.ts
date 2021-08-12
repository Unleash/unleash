import joi from 'joi';

const countSchema = joi
    .object()
    .options({ stripUnknown: true })
    .keys({
        yes: joi.number().min(0).empty('').default(0),
        no: joi.number().min(0).empty('').default(0),
        variants: joi.object().pattern(joi.string(), joi.number().min(0)),
    });

export const clientMetricsSchema = joi
    .object()
    .options({ stripUnknown: true })
    .keys({
        appName: joi.string().required(),
        instanceId: joi.string().required(),
        bucket: joi
            .object()
            .required()
            .keys({
                start: joi.date().required(),
                stop: joi.date().required(),
                toggles: joi.object().pattern(/.*/, countSchema),
            }),
    });
