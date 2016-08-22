'use strict';
function getDatabaseUri () {
    if (!process.env.TEST_DATABASE_URL) {
        throw new Error('please set TEST_DATABASE_URL');
    }

    return process.env.TEST_DATABASE_URL;
}

module.exports = {
    getDatabaseUri,
};
