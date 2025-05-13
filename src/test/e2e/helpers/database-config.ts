import parseDbUrl from 'parse-database-url';
import type { IUnleashConfig } from '../../../lib/internals.js';

export const getDbConfig = (): IUnleashConfig['db'] => {
    const url =
        process.env.TEST_DATABASE_URL ||
        'postgres://unleash_user:password@localhost:5432/unleash_test';
    return parseDbUrl(url);
};
