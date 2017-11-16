'use strict';

const responseTime = require('response-time');
const { REQUEST_TIME } = require('../events');

module.exports = function(config) {
    return responseTime((req, res, time) => {
        const timingInfo = {
            path: req.baseUrl,
            method: req.method,
            statusCode: res.statusCode,
            time,
        };
        config.eventBus.emit(REQUEST_TIME, timingInfo);
    });
};
