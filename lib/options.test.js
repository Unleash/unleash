'use strict';

const { test } = require('ava');

delete process.env.DATABASE_URL;

test('should require DATABASE_URI', t => {
    const { createOptions } = require('./options');

    t.throws(() => {
        createOptions({});
    });
});

test('should set default databaseUrl for develpment', t => {
    process.env.NODE_ENV = 'development';
    const { createOptions } = require('./options');

    const options = createOptions({});

    t.true(
        options.databaseUrl ===
            'postgres://unleash_user:passord@localhost:5432/unleash'
    );
});

test('should not override provided options', t => {
    process.env.DATABASE_URL = 'test';
    process.env.NODE_ENV = 'production';

    const { createOptions } = require('./options');
    const options = createOptions({ databaseUrl: 'test', port: 1111 });

    t.true(options.databaseUrl === 'test');
    t.true(options.port === 1111);
});
