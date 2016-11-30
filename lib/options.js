'use strict';

const DEFAULT_OPTIONS = {
    databaseUri: process.env.DATABASE_URL || 'postgres://unleash_user:passord@localhost:5432/unleash',
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    baseUriPath: process.env.BASE_URI_PATH || '',
    serverMetrics: true,
};

module.exports = {
    createOptions: (opts) => {
        const options =  Object.assign({}, DEFAULT_OPTIONS, opts);
         if (!options.databaseUri) {
            throw new Error('You must either pass databaseUri option or set environemnt variable DATABASE_URL');
        }
        return options;
    }
}