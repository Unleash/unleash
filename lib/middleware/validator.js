'use strict';

const validator = require('express-validator');

module.exports = function() {
    return validator({
        customValidators: {
            isUrlFriendlyName: input => encodeURIComponent(input) === input,
        },
    });
};
