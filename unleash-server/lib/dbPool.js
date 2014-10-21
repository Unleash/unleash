var anyDB = require('any-db'),
    logger = require('./logger'),
    nconf = require('nconf'),
    fs = require('fs'),
    ini = require('ini');


function createDbPool() {
    if (nconf.argv().get('databaseini') !== undefined) {
        var databaseini = nconf.argv().get('databaseini');

        logger.info('unleash started with databaseini: ' + databaseini);

        var config = ini.parse(fs.readFileSync(databaseini, 'utf-8'));

        return anyDB.createPool(config.DATABASE_URL, {min: 2, max: 20});
    }
}

module.exports = {
    pool: createDbPool()
};