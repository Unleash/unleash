'use strict';

const { publicFolder } = require('unleash-frontend');
const { defaultLogProvider, validateLogProvider } = require('./logger');

const isDev = () => process.env.NODE_ENV === 'development';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_OPTIONS = {
    databaseUrl:
        process.env.DATABASE_URL || process.env.DATABASE_HOST
            ? defaultDatabaseUrl()
            : null,
    databaseSchema: 'public',
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    host: process.env.HTTP_HOST,
    pipe: undefined,
    baseUriPath: process.env.BASE_URI_PATH || '',
    serverMetrics: true,
    enableLegacyRoutes: true,
    extendedPermissions: false,
    publicFolder,
    enableRequestLogger: isDev(),
    secret: 'UNLEASH-SECRET',
    sessionAge: THIRTY_DAYS,
    adminAuthentication: 'unsecure',
    ui: {},
    importFile: undefined,
    dropBeforeImport: false,
    getLogger: defaultLogProvider,
};

function defaultDatabaseUrl() {
    const dbUsername = process.env.DATABASE_USERNAME || 'unleash_user';
    const dbPassword = process.env.DATABASE_PASSWORD || 'passord';
    const dbHost = process.env.DATABASE_HOST || 'localhost';
    const dbPort = process.env.DATABASE_PORT || 5432;
    const dbName = process.env.DATABASE_NAME || 'unleash';
    const sslSupport = process.env.DATABASE_SSL || 'true';
    return `postgres://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?ssl=${sslSupport}`;
}

module.exports = {
    createOptions: opts => {
        const options = Object.assign({}, DEFAULT_OPTIONS, opts);

        // If we are running in development we should assume local db
        if (isDev() && !options.databaseUrl) {
            options.databaseUrl = defaultDatabaseUrl();
        }

        if (!options.databaseUrl) {
            throw new Error(
                'You must either pass databaseUrl option or set environemnt variable DATABASE_URL || (DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME)'
            );
        }

        options.listen = options.pipe
            ? { path: options.pipe }
            : { port: options.port, host: options.host };

        validateLogProvider(options.getLogger);

        return options;
    },
};
