'use strict';

const ValidationError = require('./validation-error');

function validateRequest (req) {
    return new Promise((resolve, reject) => {
        if (req.validationErrors()) {
            reject(new ValidationError('Invalid syntax'));
        } else {
            resolve(req);
        }
    });
}

module.exports =  validateRequest;
