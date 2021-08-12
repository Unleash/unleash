import { parse } from 'pg-connection-string';
import merge from 'deepmerge';
import * as fs from 'fs';
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
import { defaultCustomAuthDenyAll } from './default-custom-auth-deny-all';
import { formatBaseUri } from './util/format-base-uri';

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
    return merge.all<T>(objects.filter((i) => i));
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
            : { rejectUnauthorized: false },
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
    baseUriPath: formatBaseUri(process.env.BASE_URI_PATH),
    unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
    serverMetrics: true,
    keepAliveTimeout: 60 * 1000,
    headersTimeout: 61 * 1000,
    enableRequestLogger: false,
    gracefulShutdownEnable: safeBoolean(
        process.env.GRACEFUL_SHUTDOWN_ENABLE,
        true,
    ),
    gracefulShutdownTimeout: safeNumber(
        process.env.GRACEFUL_SHUTDOWN_TIMEOUT,
        1000,
    ),
    secret: process.env.UNLEASH_SECRET || 'super-secret',
};

const defaultVersionOption: IVersionOption = {
    url: process.env.UNLEASH_VERSION_URL || 'https://version.unleash.run',
    enable: safeBoolean(process.env.CHECK_VERSION, true),
};

const defaultAuthentication: IAuthOption = {
    enableApiToken: safeBoolean(process.env.AUTH_ENABLE_API_TOKEN, true),
    type: authTypeFromString(process.env.AUTH_TYPE),
    customAuthHandler: defaultCustomAuthDenyAll,
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

const removeUndefinedKeys = (o: object): object =>
    Object.keys(o).reduce((a, key) => {
        if (o[key] !== undefined) {
            // eslint-disable-next-line no-param-reassign
            a[key] = o[key];
            return a;
        }
        return a;
    }, {});

const formatServerOptions = (
    serverOptions?: Partial<IServerOption>,
): Partial<IServerOption> | undefined => {
    if (!serverOptions) return;

    /* eslint-disable-next-line */
    return {
        ...serverOptions,
        baseUriPath: formatBaseUri(serverOptions.baseUriPath),
    };
};

export function createConfig(options: IUnleashOptions): IUnleashConfig {
    let extraDbOptions = {};

    if (options.databaseUrl) {
        extraDbOptions = parse(options.databaseUrl);
    } else if (process.env.DATABASE_URL) {
        extraDbOptions = parse(process.env.DATABASE_URL);
    }
    let fileDbOptions = {};
    if (options.databaseUrlFile && fs.existsSync(options.databaseUrlFile)) {
        fileDbOptions = parse(
            fs.readFileSync(options.databaseUrlFile, 'utf-8'),
        );
    } else if (
        process.env.DATABASE_URL_FILE &&
        fs.existsSync(process.env.DATABASE_URL_FILE)
    ) {
        fileDbOptions = parse(
            fs.readFileSync(process.env.DATABASE_URL_FILE, 'utf-8'),
        );
    }
    const db: IDBOption = mergeAll<IDBOption>([
        defaultDbOptions,
        dbPort(extraDbOptions),
        dbPort(fileDbOptions),
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
        formatServerOptions(options.server),
    ]);

    const versionCheck: IVersionOption = mergeAll([
        defaultVersionOption,
        options.versionCheck,
    ]);

    const authentication: IAuthOption = mergeAll([
        defaultAuthentication,
        options.authentication
            ? removeUndefinedKeys(options.authentication)
            : options.authentication,
    ]);

    const ui = options.ui || {};

    const importSetting: IImportOption = mergeAll([
        defaultImport,
        options.import,
    ]);

    const experimental = options.experimental || {};

    const email: IEmailOption = mergeAll([defaultEmail, options.email]);

    let listen: IListeningPipe | IListeningHost;
    if (server.pipe) {
        listen = { path: server.pipe };
    } else {
        listen = { host: server.host || undefined, port: server.port };
    }

    const secureHeaders =
        options.secureHeaders || safeBoolean(process.env.SECURE_HEADERS, false);

    const enableOAS =
        options.enableOAS || safeBoolean(process.env.ENABLE_OAS, false);

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
        secureHeaders,
        enableOAS,
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
