'use strict';

module.exports = function noLoggerProvider() {
    // do something with the name
    return {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: console.error,
    };
};
