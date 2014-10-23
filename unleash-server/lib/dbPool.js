var anyDB = require('any-db'),
    logger = require('./logger'),
    nconf = require('nconf'),
    fs = require('fs'),
    ini = require('ini');


function createDbPool() {
    // Use postgres db from DATABASE_URL if set
    if (process.env.DATABASE_URL) {
        logger.info('unleash started with DATABASE_URL');
        return anyDB.createPool(process.env.DATABASE_URL);
    }

    // Finn specific way of delivering env variables
    else if(nconf.argv().get('databaseini') !== undefined) {
        var databaseini = nconf.argv().get('databaseini');
        logger.info('unleash started with databaseini: ' + databaseini);
        var config = ini.parse(fs.readFileSync(databaseini, 'utf-8'));
        return anyDB.createPool(config.DATABASE_URL, {min: 2, max: 20});
    }
}

module.exports = createDbPool();