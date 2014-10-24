var Promise = require('bluebird'),
    dbPool = require('./dbPool');

function storeEvent(event) {
    var sql = 'INSERT INTO events(type, created_by, data) VALUES ($1, $2, $3)';
    var params = [event.type, event.createdBy, event.data];

    return new Promise(function (resolve, reject) {
        dbPool.query(sql, params, function (err) {
            if (err) {reject(err);}
            resolve();
        });
    });
}

function getEvents() {
    var sql = 'SELECT id, type, created_by as created, data FROM events ORDER BY created_at DESC';
    return new Promise(function (resolve, reject) {
        dbPool.query(sql, function(err, res) {
            if(err) {reject(err);}
            resolve(res.rows.map(mapToEvent));
        });
    });
}

function mapToEvent(row) {
    return {
        id: row.id,
        type: row.type,
        createdBy: row.created,
        data: row.data
    };
}

module.exports = {
    store: storeEvent,
    getEvents: getEvents
};