import { parse } from 'pg-connection-string';
import merge from 'deepmerge';
import {
    IUnleashOptions,
    IUnleashConfig,
    IDBOption,
    ISessionOption,
    IServerOption,
    IVersionOption,
    IAuthOption,
    IAuthType,
    IImportOption,
    IEmailOption,
    IListeningPipe,
    IListeningHost,
} from './types/option';
import { getDefaultLogProvider, LogLevel, validateLogProvider } from './logger';

const safeToUpper = (s: string) => (s ? s.toUpperCase() : s);

export function authTypeFromString(
    s?: string,
    defaultType: IAuthType = IAuthType.OPEN_SOURCE,
): IAuthType {
    return IAuthType[safeToUpper(s)] || defaultType;
}

function safeNumber(envVar, defaultVal): number {
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

function safeBoolean(envVar, defaultVal) {
    if (envVar) {
        return envVar === 'true' || envVar === '1' || envVar === 't';
    }
    return defaultVal;
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
            : undefined,
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
    db: true,
};

const defaultServerOption: IServerOption = {
    pipe: undefined,
    host: process.env.HTTP_HOST,
    port: safeNumber(process.env.HTTP_PORT || process.env.PORT, 4242),
    baseUriPath: process.env.BASE_URI_PATH || '',
    unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
    serverMetrics: true,
    keepAliveTimeout: 60 * 1000,
    headersTimeout: 61 * 1000,
    enableRequestLogger: false,
    secret: process.env.UNLEASH_SECRET || 'super-secret',
};

const defaultVersionOption: IVersionOption = {
    url: process.env.UNLEASH_VERSION_URL || 'https://version.unleash.run',
    enable: safeBoolean(process.env.CHECK_VERSION, true),
};

const defaultAuthentication: IAuthOption = {
    enableApiToken: safeBoolean(process.env.AUTH_ENABLE_API_TOKEN, true),
    type: authTypeFromString(process.env.AUTH_TYPE),
    customAuthHandler: () => {},
    createAdminUser: true,
};

const defaultImport: IImportOption = {
    file: process.env.IMPORT_FILE,
    dropBeforeImport: safeBoolean(process.env.IMPORT_DROP_BEFORE_IMPORT, false),
    keepExisting: safeBoolean(process.env.IMPORT_KEEP_EXISTING, false),
};

const defaultEmail: IEmailOption = {
    host: process.env.EMAIL_HOST,
    secure: safeBoolean(process.env.EMAIL_SECURE, false),
    port: safeNumber(process.env.EMAIL_PORT, 567),
    sender: process.env.EMAIL_SENDER || 'noreply@unleash-hosted.com',
    smtpuser: process.env.EMAIL_USER,
    smtppass: process.env.EMAIL_PASSWORD,
};

const dbPort = (dbConfig: Partial<IDBOption>): Partial<IDBOption> => {
    if (typeof dbConfig.port === 'string') {
        // eslint-disable-next-line no-param-reassign
        dbConfig.port = Number.parseInt(dbConfig.port, 10);
    }
    return dbConfig;
};

export function createConfig(options: IUnleashOptions): IUnleashConfig {
    let extraDbOptions = {};
    if (options.databaseUrl) {
        extraDbOptions = parse(options.databaseUrl);
    } else if (process.env.DATABASE_URL) {
        extraDbOptions = parse(process.env.DATABASE_URL);
    }
    const db: IDBOption = mergeAll<IDBOption>([
        defaultDbOptions,
        dbPort(extraDbOptions),
        options.db,
    ]);

    const session: ISessionOption = mergeAll([
        defaultSessionOption,
        options.session,
    ]);

    const logLevel =
        options.logLevel || LogLevel[process.env.LOG_LEVEL] || LogLevel.error;
    const getLogger = options.getLogger || getDefaultLogProvider(logLevel);
    validateLogProvider(getLogger);

    const server: IServerOption = mergeAll([
        defaultServerOption,
        options.server,
    ]);

    const versionCheck: IVersionOption = mergeAll([
        defaultVersionOption,
        options.versionCheck,
    ]);

    const authentication: IAuthOption = mergeAll([
        defaultAuthentication,
        options.authentication,
    ]);

    const { ui } = options;

    const importSetting: IImportOption = mergeAll([
        defaultImport,
        options.import,
    ]);

    const { experimental } = options;

    const email: IEmailOption = mergeAll([defaultEmail, options.email]);

    let listen: IListeningPipe | IListeningHost;
    if (server.pipe) {
        listen = { path: server.pipe };
    } else {
        listen = { host: server.host || undefined, port: server.port };
    }

    return {
        db,
        session,
        getLogger,
        server,
        listen,
        versionCheck,
        authentication,
        ui,
        import: importSetting,
        experimental: experimental || {},
        email,
        secureHeaders: safeBoolean(process.env.SECURE_HEADERS, false),
        enableOAS: safeBoolean(process.env.ENABLE_OAS, false),
        preHook: options.preHook,
        preRouterHook: options.preRouterHook,
        eventHook: options.eventHook,
        enterpriseVersion: options.enterpriseVersion,
    };
}

module.exports = {
    createConfig,
    authTypeFromString,
};
