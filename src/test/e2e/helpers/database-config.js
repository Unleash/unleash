'use strict';

const parseDbUrl = require('parse-database-url');

module.exports = {
    getDb: () => {
        const url =
            process.env.TEST_DATABASE_URL ||
            'postgres://unleash_user:passord@localhost:5432/unleash_test';
        return parseDbUrl(url);
    },
};
