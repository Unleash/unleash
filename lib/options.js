'use strict';

const { publicFolder } = require('unleash-frontend');
const { defaultLogProvider, validateLogProvider } = require('./logger');
const parseDatabaseUrl = require('parse-database-url');

const isDev = () => process.env.NODE_ENV === 'development';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function defaultOptions() {
    return {
        database: getDatabase(),
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
}

function getDatabase() {
    if (process.env.DATABASE_URL) {
        const parsed = parseDatabaseUrl(process.env.DATABASE_URL);

        // capture and remove for knex-compatible format.
        const driver = parsed.driver;
        delete parsed.driver;

        return {
            client: driver,
            connection: parsed,
        };
    } else {
        const env = process.env.NODE_ENV || 'development';
        const dbConnectionInfo = require('../knexfile');

        if (dbConnectionInfo[env]) {
            return dbConnectionInfo[env];
        } else {
            throw new Error(`knexfile did not contain entry for ${env}`);
        }
    }
}

module.exports = {
    createOptions: opts => {
        const options = Object.assign({}, defaultOptions(), opts);

        if (!options.database) {
            throw new Error(
                'You must either pass database option or set environemnt variable DATABASE_URL'
            );
        }

        options.listen = options.pipe
            ? { path: options.pipe }
            : { port: options.port, host: options.host };

        validateLogProvider(options.getLogger);

        return options;
    },
};
