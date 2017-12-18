'use strict';

const url = require('url');
const responseTime = require('response-time');
const { REQUEST_TIME } = require('../events');

module.exports = function(config) {
    return responseTime((req, res, time) => {
        const { pathname } = url.parse(req.originalUrl);
        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode: res.statusCode,
            time,
        };
        config.eventBus.emit(REQUEST_TIME, timingInfo);
    });
};
