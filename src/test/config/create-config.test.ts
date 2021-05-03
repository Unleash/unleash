import test from 'ava';
import { createConfig, authTypeFromString } from '../../lib/create-config';
import { IAuthType, IDBOption } from '../../lib/types/option';

test('Should use DATABASE_URL from env', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = databaseUrl;
    const config = createConfig({});
    t.is(config.db.host, 'localhost');
    t.is(config.db.password, 'p');
    t.is(config.db.user, 'u');
    t.is(config.db.database, 'name');
    t.is(config.db.schema, 'public');
});

test('Should use databaseURl from options', t => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const config = createConfig({ databaseUrl });
    t.is(config.db.host, 'localhost');
    t.is(config.db.password, 'p');
    t.is(config.db.user, 'u');
    t.is(config.db.database, 'name');
    t.is(config.db.schema, 'public');
});

test('Actual config values takes precedence over environment variables', t => {
    process.env.DATABASE_URL = 'postgres://test:5432/name';
    process.env.NODE_ENV = 'production';

    const config = createConfig({
        databaseUrl: 'postgres://test:1234/othername',
    });
    t.is(config.db.port, 1234);
    t.is(config.db.database, 'othername');
});

test('should validate getLogger', t => {
    const getLogger = () => {};
    t.throws(() => {
        // @ts-ignore
        createConfig({ getLogger });
    });
});

test('should allow setting pool size', t => {
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
    t.is(config.db.pool.min, min);
    t.is(config.db.pool.max, max);
    t.is(config.db.driver, 'postgres');
});

test('Can set baseUriPath', t => {
    const baseUriPath = '/some';
    const config = createConfig({ server: { baseUriPath } });
    t.is(config.server.baseUriPath, baseUriPath);
});

test('can convert both upper and lowercase string to enum', t => {
    t.is(authTypeFromString('demo'), IAuthType.DEMO);
    t.is(authTypeFromString('DEMO'), IAuthType.DEMO);
    t.is(authTypeFromString('DeMo'), IAuthType.DEMO);
    t.is(authTypeFromString('open_source'), IAuthType.OPEN_SOURCE);
    t.is(authTypeFromString('OPEN_SOURCE'), IAuthType.OPEN_SOURCE);
    t.is(authTypeFromString('ENTERPRISE'), IAuthType.ENTERPRISE);
    t.is(authTypeFromString('enterprise'), IAuthType.ENTERPRISE);
    t.is(authTypeFromString('custom'), IAuthType.CUSTOM);
    t.is(authTypeFromString('CUSTOM'), IAuthType.CUSTOM);
    t.is(authTypeFromString('none'), IAuthType.NONE);
    t.is(authTypeFromString('NONE'), IAuthType.NONE);
    t.is(authTypeFromString('unknown-string'), IAuthType.OPEN_SOURCE);
});

test('Can set auth type programmatically with a string', t => {
    const config = createConfig({
        authentication: {
            // @ts-ignore
            type: 'demo',
        },
    });
    t.is(config.authentication.type, IAuthType.DEMO);
});
