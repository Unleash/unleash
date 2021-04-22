'use strict';

const logger = require('./logger');

test('should expose a setLoggerProvider function', () => {
    expect(logger.setLoggerProvider instanceof Function).toBe(true);
});

test('should require custom logger to implement info', () => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        error: () => {},
    };
    const provider = () => loggerImpl;
    expect(() => {
        logger.setLoggerProvider(provider)();
    }).toThrowError(new TypeError('Logger must implement info'));
});

test('should require custom logger to implement error', () => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        info: () => {},
    };
    const provider = () => loggerImpl;
    expect(() => {
        logger.setLoggerProvider(provider)();
    }).toThrowError(new TypeError('Logger must implement error'));
});
