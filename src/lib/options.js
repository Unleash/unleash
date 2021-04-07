'use strict';

const { readFileSync } = require('fs');
const parseDbUrl = require('parse-database-url');
const merge = require('deepmerge');
const { publicFolder } = require('unleash-frontend');
const { defaultLogProvider, validateLogProvider } = require('./logger');
const version = require('./util/version');

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

function defaultDatabaseUrl() {
    if (process.env.DATABASE_URL_FILE) {
        return readFileSync(process.env.DATABASE_URL_FILE, 'utf8');
    }
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    return undefined;
}

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

function defaultOptions() {
    return {
        databaseUrl: defaultDatabaseUrl(),
        databaseSchema: process.env.DATABASE_SCHEMA || 'public',
        db: {
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT || 5432,
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
        },
        session: {
            db: process.env.DB_SESSION || true,
            age: TWO_DAYS,
        },
        port: process.env.HTTP_PORT || process.env.PORT || 4242,
        host: process.env.HTTP_HOST,
        pipe: undefined,
        baseUriPath: process.env.BASE_URI_PATH || '',
        unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
        serverMetrics: true,
        enableLegacyRoutes: false, // deprecated. Remove in v4,
        extendedPermissions: true, // deprecated. Remove in v4,
        publicFolder,
        versionCheck: {
            url:
                process.env.UNLEASH_VERSION_URL ||
                'https://version.unleash.run',
            enable: process.env.CHECK_VERSION || 'true',
        },
        enableRequestLogger: false,
        adminAuthentication: process.env.ADMIN_AUTHENTICATION || 'open-source', // deprecated. Remove in v4,
        authentication: {
            enableApiToken: process.env.AUTH_ENABLE_API_TOKEN || true,
            type: process.env.AUTH_TYPE || 'open-source',
            customHook: () => {},
            createAdminUser: true,
        },
        ui: {},
        importFile: process.env.IMPORT_FILE,
        importKeepExisting: process.env.IMPORT_KEEP_EXISTING || false,
        dropBeforeImport: process.env.IMPORT_DROP_BEFORE_IMPORT || false,
        getLogger: defaultLogProvider,
        customContextFields: [], // deprecated. Remove in v4,
        disableDBMigration: false,
        start: true,
        keepAliveTimeout: 60 * 1000,
        headersTimeout: 61 * 1000,
        version,
        secureHeaders: process.env.SECURE_HEADERS || false,
        enableOAS: process.env.ENABLE_OAS || false,
        experimental: {
            clientFeatureMemoize: {
                enabled: process.env.CLIENT_FEATURE_MEMOIZE || false,
                maxAge: process.env.CLIENT_FEATURE_MAXAGE || 1000,
            },
            rbac: false,
        },
        email: {
            host: process.env.EMAIL_HOST,
            secure: !!process.env.EMAIL_SECURE,
            port: process.env.EMAIL_PORT || 465,
            sender: process.env.EMAIL_SENDER || 'noreply@unleash-hosted.com',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        },
    };
}

module.exports = {
    createOptions: (opts = {}) => {
        const options = merge(defaultOptions(), opts);

        // Use DATABASE_URL when 'db' not defined.
        if (!opts.db && options.databaseUrl) {
            options.db = parseDbUrl(options.databaseUrl);
            options.db.pool = defaultOptions().db.pool;
        }

        // If poolMin and poolMax is set, override pool settings
        if (opts.poolMin) {
            options.db.pool.min = opts.poolMin;
        }
        if (opts.poolMax) {
            options.db.pool.max = opts.poolMax;
        }

        if (!options.db.host) {
            throw new Error(
                'Unleash requires database details to start. See https://docs.getunleash.io/docs/deploy/configuring_unleash',
            );
        }

        options.listen = options.pipe
            ? { path: options.pipe }
            : { port: options.port, host: options.host };

        validateLogProvider(options.getLogger);

        return options;
    },
};
