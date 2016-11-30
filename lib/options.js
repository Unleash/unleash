'use strict';

const DEFAULT_OPTIONS = {
    databaseUri: process.env.DATABASE_URL,
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    baseUriPath: process.env.BASE_URI_PATH || '',
    serverMetrics: true,
};

module.exports = {
    createOptions: (opts) => {
        const options =  Object.assign({}, DEFAULT_OPTIONS, opts);

        // If we are running in development we should assume local db
        if(process.env.NODE_ENV === 'development' && !options.databaseUri) {
            options.databaseUri = 'postgres://unleash_user:passord@localhost:5432/unleash';
        }

        if (!options.databaseUri) {
            throw new Error('You must either pass databaseUri option or set environemnt variable DATABASE_URL');
        }
        return options;
    }
}