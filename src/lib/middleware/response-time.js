'use strict';

const url = require('url');
const responseTime = require('response-time');
const { REQUEST_TIME } = require('../events');

module.exports = function(config) {
    return responseTime((req, res, time) => {
        const { statusCode } = res;
        const pathname = req.route
            ? url.parse(req.originalUrl).pathname
            : '(hidden)';

        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode,
            time,
        };
        config.eventBus.emit(REQUEST_TIME, timingInfo);
    });
};
