'use strict';

const test = require('ava');
const logger = require('./logger');

test('should require custom logger to implement info', t => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        error: () => {},
    };
    const provider = () => loggerImpl;
    const error = t.throws(
        () => {
            logger.validateLogProvider(provider)();
        },
        { instanceOf: TypeError },
    );
    t.is(error.message, 'Logger must implement info');
});

test('should require custom logger to implement error', t => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        info: () => {},
    };
    const provider = () => loggerImpl;
    const error = t.throws(
        () => {
            logger.validateLogProvider(provider)();
        },
        { instanceOf: TypeError },
    );
    t.is(error.message, 'Logger must implement error');
});
