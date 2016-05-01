var nconf  = require('nconf');
var fs     = require('fs');
var ini    = require('ini');
var logger = require('./logger');

function getDatabaseIniUrl() {
    // Finn specific way of delivering env variables
    var databaseini = nconf.argv().get('databaseini');
    var config = ini.parse(fs.readFileSync(databaseini, 'utf-8'));

    logger.info('unleash started with databaseini: ' + databaseini);

    return config.DATABASE_URL;
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

module.exports =  {
    getDatabaseUrl: getDatabaseUrl
};
