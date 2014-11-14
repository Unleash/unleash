var logger = require('./logger');
var nconf  = require('nconf');
var fs     = require('fs');
var ini    = require('ini');
var knex   = require('knex');

function getDatabaseUrl() {
    if (process.env.DATABASE_URL) {
        logger.info('unleash started with DATABASE_URL');

        return process.env.DATABASE_URL;
    } else if (nconf.argv().get('databaseini') !== undefined) {
        // Finn specific way of delivering env variables
        var databaseini = nconf.argv().get('databaseini');
        logger.info('unleash started with databaseini: ' + databaseini);
        var config = ini.parse(fs.readFileSync(databaseini, 'utf-8'));

        return config.DATABASE_URL;
    }

    throw new Error('please set DATABASE_URL or pass --databaseini');
}

function createDbPool() {
    return knex({
        client: 'pg',
        connection: getDatabaseUrl(),
        pool: {min: 2, max: 20}
    });
}

module.exports = createDbPool();