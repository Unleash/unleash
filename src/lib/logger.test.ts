import * as logger from './logger';

test('should require custom logger to implement info', () => {
    const loggerImpl = {
        debug: () => {},
        warn: () => {},
        error: () => {},
    };
    const provider = () => loggerImpl;
    expect(() => {
        // @ts-ignore:next-line
        return logger.validateLogProvider(provider);
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
        // @ts-ignore:next-line
        return logger.validateLogProvider(provider);
    }).toThrowError(new TypeError('Logger must implement error'));
});
