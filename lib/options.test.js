'use strict';

const test = require('ava');
const fs = require('fs');

delete process.env.DATABASE_URL;

test('should require DATABASE_URI', t => {
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

    t.true(
        options.databaseUrl ===
            'postgres://unleash_user:passord@localhost:5432/unleash?ssl=true'
    );
});

test('should use DATABASE_URL from env', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = databaseUrl;
    const { createOptions } = require('./options');

    const options = createOptions({});

    t.true(options.databaseUrl === databaseUrl);
});

test('should use DATABASE_URL_FILE from env', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const path = '/tmp/db_url';
    fs.writeFileSync(path, databaseUrl, { mode: 0o755 });
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL_FILE = path;
    const { createOptions } = require('./options');

    const options = createOptions({});

    t.true(options.databaseUrl === databaseUrl);
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
    const options = createOptions({ databaseUrl: 'test', port: 1111 });

    t.true(options.databaseUrl === 'test');
    t.true(options.port === 1111);
});
