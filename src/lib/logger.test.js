'use strict';;
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
    const error = expect(() => {
        logger.setLoggerProvider(provider)();
    }).toThrowError({ instanceOf: TypeError });
    expect(error.message).toBe('Logger must implement info');
});

test('should require custom logger to implement error', () => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        info: () => {},
    };
    const provider = () => loggerImpl;
    const error = expect(() => {
        logger.setLoggerProvider(provider)();
    }).toThrowError({ instanceOf: TypeError });
    expect(error.message).toBe('Logger must implement error');
});
