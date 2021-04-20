import parseDbUrl from 'parse-database-url';
import merge from 'deepmerge';
import {
    IUnleashOptions,
    IUnleashConfig,
    IDBOption,
    ISessionOption,
    IServerOption,
} from './types/option';
import { defaultLogProvider, validateLogProvider } from './logger';

function safeNumber(envVar, defaultVal) {
    if (envVar) {
        try {
            return Number.parseInt(envVar, 10);
        } catch (err) {
            return defaultVal;
        }
    } else {
        return defaultVal;
    }
}

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter(i => i));
}

const defaultDbOptions: IDBOption = {
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: safeNumber(process.env.DATABASE_PORT, 5432),
    database: process.env.DATABASE_NAME || 'unleash',
    ssl:
        process.env.DATABASE_SSL != null
            ? JSON.parse(process.env.DATABASE_SSL)
            : false,
    driver: 'postgres',
    version: process.env.DATABASE_VERSION,
    pool: {
        min: safeNumber(process.env.DATABASE_POOL_MIN, 0),
        max: safeNumber(process.env.DATABASE_POOL_MAX, 4),
        idleTimeoutMillis: safeNumber(
            process.env.DATABASE_POOL_IDLE_TIMEOUT_MS,
            30000,
        ),
    },
    schema: process.env.DATABASE_SCHEMA || 'public',
    disableMigration: false,
};

const defaultSessionOption: ISessionOption = {
    ttlHours: safeNumber(process.env.SESSION_TTL_HOURS, 48),
};

const createConfig = (options: IUnleashOptions): IUnleashConfig => {
    let extraDbOptions = {};
    if (options.databaseUrl) {
        extraDbOptions = parseDbUrl(options.databaseUrl);
    }
    const db: IDBOption = mergeAll<IDBOption>([
        defaultDbOptions,
        extraDbOptions,
        options.db,
    ]);

    const session: ISessionOption = mergeAll([
        defaultSessionOption,
        options.session,
    ]);

    const getLogger = options.getLogger || defaultLogProvider;
    validateLogProvider(getLogger);

    const server: IServerOption = mergeAll([
        defaultServerOption,
        options.server,
    ]);

    return {
        db,
        session,
        getLogger,
    };
};

export default createConfig;
