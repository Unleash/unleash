'use strict';

function getDatabaseUri () {
    if (process.env.TEST_DATABASE_URL) {
        return process.env.TEST_DATABASE_URL;
    } else {
        console.log('Using default unleash_test database');
        return 'postgres://unleash_user:passord@localhost:5432/unleash_test';
    }
}

module.exports = {
    getDatabaseUri,
};
