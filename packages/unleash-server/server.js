'use strict';

const unleash = require('unleash-api');
const { publicFolder } = require('unleash-frontend');


module.exports = {
    start: options => {
        const opts = Object.assign({}, { publicFolder }, options);
        return unleash.start(opts);
    },
};
