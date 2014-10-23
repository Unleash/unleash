var eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    logger = require('./logger'),
    Promise = require('bluebird'),
    dbPool = require('./dbPool');

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
    var sql = 'SELECT name, enabled, strategy_name as strategy, parameters FROM features ORDER BY created_at';
    return new Promise(function (resolve, reject) {
        dbPool.query(sql, function(err, res) {
            if(err) {reject(err);}
            resolve(res.rows.map(mapToToggle));
        });
    });
}

function mapToToggle(row) {
    return {
        name: row.name,
        enabled: row.enabled > 0,
        strategy: row.strategy,
        parameters: row.parameters
    };
}

module.exports = {
    getFeatures: getFeatures
};

