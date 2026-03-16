import type { IDBOption } from '../types/index.js';
import { cloneDbConfig } from './clone-db-config.js';

test('should clone nested ssl config independently', () => {
    const dbConfig = {
        user: 'user',
        password: 'password',
        host: 'localhost',
        port: 5432,
        database: 'unleash',
        ssl: {
            rejectUnauthorized: true,
            ca: 'ca-cert',
            cert: 'client-cert',
            key: 'client-key',
        },
        driver: 'postgres',
        schema: 'public',
        disableMigration: false,
        pool: {
            min: 0,
            max: 4,
        },
    } satisfies IDBOption;

    const cloned = cloneDbConfig(dbConfig);
    const clonedSsl = cloned.ssl as Exclude<
        IDBOption['ssl'],
        boolean | undefined
    >;
    const originalSsl = dbConfig.ssl as Exclude<
        IDBOption['ssl'],
        boolean | undefined
    >;

    expect(cloned).not.toBe(dbConfig);
    expect(cloned.pool).not.toBe(dbConfig.pool);
    expect(clonedSsl).not.toBe(originalSsl);

    Object.defineProperty(clonedSsl, 'key', {
        configurable: true,
        enumerable: false,
        value: 'mutated-key',
        writable: true,
    });

    expect(Object.keys(clonedSsl)).not.toContain('key');
    expect(clonedSsl.key).toBe('mutated-key');
    expect(originalSsl.key).toBe('client-key');
    expect(Object.keys(originalSsl)).toContain('key');
});
