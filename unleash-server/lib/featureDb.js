var eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    featuresMock = require('./featuresMock'),
    logger = require('./logger'),
    Promise = require('bluebird'),
    dbPool = require('./dbPool');
/*
 name varchar(255) PRIMARY KEY NOT NULL,
 enabled integer default 0,
 strategy_name varchar(255) references strategies(name),
 parameters json
 */

eventStore.on(eventType.featureCreated, function (event) {
        var sql = 'INSERT INTO features(name, enabled, strategy_name, parameters) VALUES ($1, $2, $3, $4)';
        var params = [
            event.data.name,
            event.data.enabled ? 1 : 0,
            event.data.strategy,
            event.data.parameters
        ];

        dbPool.query(sql, params, function(err) {
            if(err) {
                logger.error('Could not insert feature, error was: ', err);
            }
        });
    }
);

function getFeatures() {
    return Promise.resolve(featuresMock);
}

module.exports = {
    getFeatures: getFeatures
};

