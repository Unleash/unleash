'use strict';

const validator = require('express-validator');

module.exports = function() {
    return validator({
        customValidators: {
            isUrlFirendlyName: input => encodeURIComponent(input) === input,
        },
    });
};
