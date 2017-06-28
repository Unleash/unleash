'use strict';

const joi = require('joi');

const clientMetricsSchema = joi.object().keys({
    appName: joi.string().required(),
    instanceId: joi.string().required(),
    bucket: joi.object().required().keys({
        start: joi.date().required(),
        stop: joi.date().required(),
        toggles: joi.object(),
    }),
});

module.exports = { clientMetricsSchema };
