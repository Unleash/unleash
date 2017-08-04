'use strict';

const logger = require('../../logger')('route-utils.js');

const catchLogAndSendErrorResponse = (err, res) => {
    logger.error(err);
    res.status(500).end();
};

module.exports = { catchLogAndSendErrorResponse };
