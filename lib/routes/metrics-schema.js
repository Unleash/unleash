const joi = require('joi');

const clientMetricsSchema = joi.object().keys({
    appName: joi.string().required(),
    instanceId: joi.string().required(),
    bucket: joi.object().required()
    .keys({
        start: joi.date().required(),
        stop: joi.date().required(),
        toggles: joi.object(),
    }),
});

const clientRegisterSchema = joi.object().keys({
    appName: joi.string().required(),
    instanceId: joi.string().required(),
    strategies: joi.array()
        .required()
        .items(joi.string(), joi.any().strip()),
    started: joi.date().required(),
    interval: joi.number().required(),
});

module.exports = { clientMetricsSchema, clientRegisterSchema }