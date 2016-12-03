'use strict';

function getDatabaseUrl () {
    if (process.env.TEST_DATABASE_URL) {
        return process.env.TEST_DATABASE_URL;
    } else {
        return 'postgres://unleash_user:passord@localhost:5432/unleash_test';
    }
}

module.exports = {
    getDatabaseUrl,
};
