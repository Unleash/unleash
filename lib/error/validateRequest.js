var Promise = require("bluebird");
var ValidationError = require('./ValidationError');

function validateRequest(req) {
    return new Promise(function(resolve, reject) {
        if (req.validationErrors()) {
            reject(new ValidationError("Invalid syntax"));
        } else {
            resolve(req);
        }
    });
}

module.exports =  validateRequest;