'use strict';

const { test } = require('ava');
const createLogger = require('./logger');
const logger = require('../logger');

test('should expose a setLoggerProvider function', t => {
    t.true(logger.setLoggerProvider instanceof Function);
});

test('should create logger via custom logger provider', t => {
    const loggerName = 'test';
    const loggerImpl = {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
    };
    const provider = () => loggerImpl;
    logger.setLoggerProvider(provider);

    const log = createLogger(loggerName);

    t.is(log, loggerImpl);
});

test('should require custom logger to implement info', t => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        error: () => {},
    };
    const provider = () => loggerImpl;
    const error = t.throws(() => {
        logger.setLoggerProvider(provider)();
    }, TypeError);
    t.is(error.message, 'Logger must implement info');
});

test('should require custom logger to implement error', t => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        info: () => {},
    };
    const provider = () => loggerImpl;
    const error = t.throws(() => {
        logger.setLoggerProvider(provider)();
    }, TypeError);
    t.is(error.message, 'Logger must implement error');
});
