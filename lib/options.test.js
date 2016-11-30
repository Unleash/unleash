'use strict';

const test = require('ava');

delete process.env.DATABASE_URL;
const { createOptions } = require('./options');

test('should require DATABASE_URI', t => {
    t.throws(() => {
        const options = createOptions({});
    });
});

test('should set default databaseUri for develpment', t => {
    process.env.NODE_ENV = 'development';    
    const { createOptions } = require('./options');
    
    const options = createOptions({});

    t.true(options.databaseUri === 'postgres://unleash_user:passord@localhost:5432/unleash');
});

test('should not override provided options', t => {
    process.env.DATABASE_URL = 'test';    
    process.env.NODE_ENV = 'production';

    const { createOptions } = require('./options');
    const options = createOptions({databaseUri: 'test', port: 1111});

    t.true(options.databaseUri === 'test');
    t.true(options.port === 1111);
});