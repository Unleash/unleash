var logger = require('./logger');
var nconf  = require('nconf');
var fs     = require('fs');
var ini    = require('ini');
var knex   = require('knex');

function isTestEnv() {
    return process.env.NODE_ENV === 'test';
}

function getDatabaseIniUrl() {
    // Finn specific way of delivering env variables
    var databaseini = nconf.argv().get('databaseini');
    var config = ini.parse(fs.readFileSync(databaseini, 'utf-8'));

    logger.info('unleash started with databaseini: ' + databaseini);

    return config.DATABASE_URL;
}

function getTestDatabaseUrl() {
    if (process.env.TEST_DATABASE_URL) {
        logger.info('unleash started with TEST_DATABASE_URL');
        return process.env.TEST_DATABASE_URL;
    } else {
        throw new Error('please set TEST_DATABASE_URL');
    }
}

function getDatabaseUrl() {
    if (process.env.DATABASE_URL) {
        logger.info('unleash started with DATABASE_URL');
        return process.env.DATABASE_URL;
    } else if (nconf.argv().get('databaseini') !== undefined) {
        return getDatabaseIniUrl();
    }

    throw new Error('please set DATABASE_URL or pass --databaseini');
}

function createDbPool() {
    return knex({
        client: 'pg',
        connection: isTestEnv() ? getTestDatabaseUrl() : getDatabaseUrl(),
        pool: {min: 2, max: 20}
    });
}

module.exports = createDbPool();