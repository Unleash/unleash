'use strict';

const test = require('ava');

delete process.env.DATABASE_URL;

test('should require DATABASE_URI', t => {
    delete process.env.NODE_ENV;
    process.env.NODE_ENV = 'non-existent';
    const { createOptions } = require('./options');

    t.throws(() => {
        createOptions({});
    });
});

test('should set default databaseUrl for development', t => {
    delete process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const { createOptions } = require('./options');

    const options = createOptions({});

    const knownConfig = require('../knexfile').development;

    t.deepEqual(options.database, knownConfig);
});

test('should use DATABASE_URL from env', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = databaseUrl;
    const { createOptions } = require('./options');

    const options = createOptions({});

    t.true(options.database.client === 'postgres');
    t.true(options.database.connection.host === 'localhost');
    t.true(options.database.connection.port === '5432');
});

test('should use databaseUrl from options', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const { createOptions } = require('./options');

    const options = createOptions({ databaseUrl });

    t.true(options.databaseUrl === databaseUrl);
});

test('should not override provided options', t => {
    process.env.DATABASE_URL = 'test';
    process.env.NODE_ENV = 'production';

    const { createOptions } = require('./options');
    const options = createOptions({ database: 'test', port: 1111 });

    t.true(options.database === 'test');
    t.true(options.port === 1111);
});
