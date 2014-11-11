var eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    logger = require('./logger'),
    Promise = require('bluebird'),
    dbPool = require('./dbPool');

eventStore.on(eventType.featureCreated, function (event) {
        var sql = 'INSERT INTO features(name, description, enabled, strategy_name, parameters) ' +
                   'VALUES ($1, $2, $3, $4, $5)';
        var params = [
            event.data.name,
            event.data.description,
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

eventStore.on(eventType.featureUpdated, function (event) {
        var sql, params;
        var changeRequest = event.data;

        switch (changeRequest.field) {
            case 'enabled':
                sql = 'UPDATE features SET enabled = $1 WHERE name=$2';
                params = [event.data.value ? 1 : 0, event.data.name];
                break;
            case 'strategy':
                sql = 'UPDATE features SET strategy_name = $1 WHERE name=$2';
                params = [event.data.value, event.data.name];
                break;
            case 'description':
                sql = 'UPDATE features SET description = $1 WHERE name=$2';
                params = [event.data.value, event.data.name];
                break;
            case 'parameters':
                sql = 'UPDATE features SET parameters = $1 WHERE name=$2';
                params = [event.data.value, event.data.name];
                break;
            default:
                break;
        }


        if(sql && params) {
            dbPool.query(sql, params, function(err) {
                if(err) {
                    logger.error('Could not update feature, error was: ', err);
                }
            });
        } else {
            logger.error('Could not handle feature-update event', event);
        }

    }
);

function getFeatures() {
    var sql = 'SELECT name, description, enabled, strategy_name as strategy, parameters ' +
                 'FROM features ORDER BY created_at DESC';
    return new Promise(function (resolve, reject) {
        dbPool.query(sql, function(err, res) {
            if(err) {reject(err);}
            resolve(res.rows.map(mapToToggle));
        });
    });
}

function getFeature(name) {
    var sql = 'SELECT name, description, enabled, strategy_name as strategy, parameters ' +
                 'FROM features WHERE name=$1';

    return new Promise(function (resolve, reject) {
        dbPool.query(sql, [name], function(err, res) {
            if(err) {reject(err);}

            if(res.rows.length === 1) {
                resolve(mapToToggle(res.rows[0]));
            } else {
                reject();
            }
        });
    });
}

function mapToToggle(row) {
    return {
        name: row.name,
        description: row.description,
        enabled: row.enabled > 0,
        strategy: row.strategy,
        parameters: row.parameters
    };
}

module.exports = {
    getFeatures: getFeatures,
    getFeature: getFeature
};

