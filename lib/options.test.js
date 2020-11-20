/* eslint-disable no-console */

'use strict';

const test = require('ava');
const fs = require('fs');
const { createOptions } = require('./options');

delete process.env.DATABASE_URL;

test('should require DATABASE_URI', t => {
    t.throws(() => {
        createOptions({});
    });
});

test('should use DATABASE_URL from env', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = databaseUrl;

    const options = createOptions({});

    t.true(options.databaseUrl === databaseUrl);
});

test('should use DATABASE_URL_FILE from env', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const path = '/tmp/db_url';
    fs.writeFileSync(path, databaseUrl, { mode: 0o755 });
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL_FILE = path;

    const options = createOptions({});

    t.true(options.databaseUrl === databaseUrl);
});

test('should use databaseUrl from options', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';

    const options = createOptions({ databaseUrl });

    t.true(options.databaseUrl === databaseUrl);
});

test('should not override provided options', t => {
    process.env.DATABASE_URL = 'postgres://test:5432/name';
    process.env.NODE_ENV = 'production';

    const options = createOptions({
        databaseUrl: 'postgres://test:5432/name',
        port: 1111,
    });

    t.true(options.databaseUrl === 'postgres://test:5432/name');
    t.true(options.port === 1111);
});

test('should add listen options from host and port', t => {
    const options = createOptions({
        databaseUrl: 'postgres://test:5432/name',
        port: 1111,
        host: 'localhost',
    });

    t.deepEqual(options.listen, { port: 1111, host: 'localhost' });
});

test('should use pipe to path', t => {
    const options = createOptions({
        databaseUrl: 'postgres://test:5432/name',
        port: 1111,
        host: 'localhost',
        pipe: '\\\\?\\pipe',
    });

    t.deepEqual(options.listen, { path: options.pipe });
});

test('should prefer databaseUrl from options', t => {
    process.env.DATABASE_URL = 'postgres://test:5432/name';
    const databaseUrl = 'postgres://u:p@localhost:5432/options';

    const options = createOptions({ databaseUrl });

    t.deepEqual(options.databaseUrl, databaseUrl);
});

test('should expand databaseUrl from options', t => {
    process.env.DATABASE_URL = 'postgres://test:5432/name';
    const databaseUrl = 'postgres://u:p@localhost:5432/options';

    const options = createOptions({ databaseUrl });

    t.deepEqual(options.db, {
        database: 'options',
        driver: 'postgres',
        host: 'localhost',
        password: 'p',
        port: '5432',
        user: 'u',
    });
});

test('should validate getLogger', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/options';
    const getLogger = () => {};

    t.throws(() => {
        createOptions({ databaseUrl, getLogger });
    });
});

test('should accept custome log-provider', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/options';
    const getLogger = () => ({
        debug: console.log,
        info: console.log,
        warn: console.log,
        error: console.log,
    });
    const options = createOptions({ databaseUrl, getLogger });

    t.deepEqual(options.getLogger, getLogger);
});

test('should prefer custom db connection options', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/options';
    const db = {
        user: 'db_user',
        password: 'db_password',
        host: 'db-host',
        port: 3232,
        database: 'db_database',
        ssl: false,
        driver: 'postgres',
        version: '10',
    };
    const options = createOptions({ databaseUrl, db });

    t.deepEqual(options.db, db);
});

test('should baseUriPath', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/options';
    const baseUriPath = 'some';
    const options = createOptions({ databaseUrl, baseUriPath });

    t.deepEqual(options.baseUriPath, baseUriPath);
});
