'use strict';

const BPromise = require('bluebird');
const ValidationError = require('./ValidationError');

function validateRequest (req) {
    return new BPromise((resolve, reject) => {
        if (req.validationErrors()) {
            reject(new ValidationError('Invalid syntax'));
        } else {
            resolve(req);
        }
    });
}

module.exports =  validateRequest;
