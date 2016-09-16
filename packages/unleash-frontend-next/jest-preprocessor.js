// preprocessor.js
'use strict';

const ReactTools = require('react-tools');
module.exports = {
    process (src) {
        return ReactTools.transform(src);
    },
};
