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

function defaultOptions() {
    return {
        databaseUrl: defaultDatabaseUrl(),
        databaseSchema: 'public',
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
        },
        port: process.env.HTTP_PORT || process.env.PORT || 4242,
        host: process.env.HTTP_HOST,
        pipe: undefined,
        baseUriPath: process.env.BASE_URI_PATH || '',
        serverMetrics: true,
        enableLegacyRoutes: false,
        extendedPermissions: false,
        publicFolder,
        enableRequestLogger: false,
        sessionAge: TWO_DAYS,
        adminAuthentication: process.env.ADMIN_AUTHENTICATION || 'unsecure',
        ui: {},
        importFile: undefined,
        dropBeforeImport: false,
        getLogger: defaultLogProvider,
        customContextFields: [],
        disableDBMigration: false,
        start: true,
        keepAliveTimeout: 60 * 1000,
        headersTimeout: 61 * 1000,
        version,
        secureHeaders: process.env.SECURE_HEADERS || false,
    };
}

module.exports = {
    createOptions: (opts = {}) => {
        const options = merge(defaultOptions(), opts);

        // Use DATABASE_URL when 'db' not defined.
        if (!opts.db && options.databaseUrl) {
            options.db = parseDbUrl(options.databaseUrl);
        }

        if (!options.db.host) {
            throw new Error(
                `Unleash requires database details to start. See https://unleash.github.io/docs/getting_started`,
            );
        }

        options.listen = options.pipe
            ? { path: options.pipe }
            : { port: options.port, host: options.host };

        validateLogProvider(options.getLogger);

        return options;
    },
};
