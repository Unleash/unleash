'use strict';

const joi = require('joi');

const clientRegisterSchema = joi.object().keys({
    appName: joi.string().required(),
    instanceId: joi.string().required(),
    sdkVersion: joi.string().optional(),
    strategies: joi.array().required().items(joi.string(), joi.any().strip()),
    started: joi.date().required(),
    interval: joi.number().required(),
});

module.exports = { clientRegisterSchema };
