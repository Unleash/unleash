'use strict';

const { test } = require('ava');
const createLogger = require('./logger');
const logger = require('../logger');
const sinon = require('sinon');

test('should expose a setLoggerProvider function', t => {
    t.true(logger.setLoggerProvider instanceof Function);
});

test('should create logger via custom logger provider', t => {
    const provider = sinon.stub();
    const loggerName = 'test';
    const loggerImpl = {};
    provider.withArgs(loggerName).returns(loggerImpl);
    logger.setLoggerProvider(provider);

    const log = createLogger(loggerName);

    t.is(log, loggerImpl);
});
