'use strict';

const { publicFolder } = require('unleash-frontend');

const isDev = () => process.env.NODE_ENV === 'development';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_OPTIONS = {
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    host: process.env.HTTP_HOST,
    baseUriPath: process.env.BASE_URI_PATH || '',
    serverMetrics: true,
    enableLegacyRoutes: true,
    extendedPermissions: false,
    publicFolder,
    enableRequestLogger: isDev(),
    secret: 'UNLEASH-SECRET',
    sessionAge: THIRTY_DAYS,
    adminAuthentication: 'unsecure',
};

module.exports = {
    createOptions: opts => {
        const options = Object.assign({}, DEFAULT_OPTIONS, opts);

        // If we are running in development we should assume local db
        if (isDev() && !options.databaseUrl) {
            options.databaseUrl =
                'postgres://unleash_user:passord@localhost:5432/unleash';
        }

        if (!options.databaseUrl) {
            throw new Error(
                'You must either pass databaseUrl option or set environemnt variable DATABASE_URL'
            );
        }
        return options;
    },
};
