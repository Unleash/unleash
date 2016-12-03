'use strict';
const { publicFolder } = require('unleash-frontend');

const DEFAULT_OPTIONS = {
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    baseUriPath: process.env.BASE_URI_PATH || '',
    serverMetrics: true,
    publicFolder,
};

module.exports = {
    createOptions: (opts) => {
        const options =  Object.assign({}, DEFAULT_OPTIONS, opts);

        // If we are running in development we should assume local db
        if(process.env.NODE_ENV === 'development' && !options.databaseUrl) {
            options.databaseUrl = 'postgres://unleash_user:passord@localhost:5432/unleash';
        }

        if (!options.databaseUrl) {
            throw new Error('You must either pass databaseUrl option or set environemnt variable DATABASE_URL');
        }
        return options;
    }
}