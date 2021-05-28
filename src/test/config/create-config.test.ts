import * as fs from 'fs';
import { createConfig, authTypeFromString } from '../../lib/create-config';
import { IAuthType, IDBOption } from '../../lib/types/option';

test('Should use DATABASE_URL from env', () => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = databaseUrl;
    const config = createConfig({});
    expect(config.db.host).toBe('localhost');
    expect(config.db.password).toBe('p');
    expect(config.db.user).toBe('u');
    expect(config.db.database).toBe('name');
    expect(config.db.schema).toBe('public');
});

test('Should use databaseURl from options', () => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const config = createConfig({ databaseUrl });
    expect(config.db.host).toBe('localhost');
    expect(config.db.password).toBe('p');
    expect(config.db.user).toBe('u');
    expect(config.db.database).toBe('name');
    expect(config.db.schema).toBe('public');
});

test('Actual config values takes precedence over environment variables', () => {
    process.env.DATABASE_URL = 'postgres://test:5432/name';
    process.env.NODE_ENV = 'production';

    const config = createConfig({
        databaseUrl: 'postgres://test:1234/othername',
    });
    expect(config.db.port).toBe(1234);
    expect(config.db.database).toBe('othername');
});

test('should validate getLogger', () => {
    const getLogger = () => {};
    expect(() => {
        // @ts-ignore
        createConfig({ getLogger });
    }).toThrow();
});

test('should allow setting pool size', () => {
    const min = 4;
    const max = 20;
    const db: IDBOption = {
        user: 'db_user',
        password: 'db_password',
        host: 'db-host',
        port: 5432,
        database: 'unleash',
        driver: 'postgres',
        schema: 'public',
        pool: {
            min,
            max,
        },
        disableMigration: false,
    };
    const config = createConfig({ db });
    expect(config.db.pool.min).toBe(min);
    expect(config.db.pool.max).toBe(max);
    expect(config.db.driver).toBe('postgres');
});

test('Can set baseUriPath', () => {
    const baseUriPath = '/some';
    const config = createConfig({ server: { baseUriPath } });
    expect(config.server.baseUriPath).toBe(baseUriPath);
});

test('can convert both upper and lowercase string to enum', () => {
    expect(authTypeFromString('demo')).toBe(IAuthType.DEMO);
    expect(authTypeFromString('DEMO')).toBe(IAuthType.DEMO);
    expect(authTypeFromString('DeMo')).toBe(IAuthType.DEMO);
    expect(authTypeFromString('open_source')).toBe(IAuthType.OPEN_SOURCE);
    expect(authTypeFromString('OPEN_SOURCE')).toBe(IAuthType.OPEN_SOURCE);
    expect(authTypeFromString('ENTERPRISE')).toBe(IAuthType.ENTERPRISE);
    expect(authTypeFromString('enterprise')).toBe(IAuthType.ENTERPRISE);
    expect(authTypeFromString('custom')).toBe(IAuthType.CUSTOM);
    expect(authTypeFromString('CUSTOM')).toBe(IAuthType.CUSTOM);
    expect(authTypeFromString('none')).toBe(IAuthType.NONE);
    expect(authTypeFromString('NONE')).toBe(IAuthType.NONE);
    expect(authTypeFromString('unknown-string')).toBe(IAuthType.OPEN_SOURCE);
});

test('Can set auth type programmatically with a string', () => {
    const config = createConfig({
        authentication: {
            // @ts-ignore
            type: 'demo',
        },
    });
    expect(config.authentication.type).toBe(IAuthType.DEMO);
});

test('should use DATABASE_URL_FILE from env', () => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const path = '/tmp/db_url';
    fs.writeFileSync(path, databaseUrl, { mode: 0o755 });
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL_FILE = path;
    const config = createConfig({});

    expect(config.db.host).toBe('localhost');
    expect(config.db.password).toBe('p');
    expect(config.db.user).toBe('u');
    expect(config.db.database).toBe('name');
    expect(config.db.schema).toBe('public');
});
