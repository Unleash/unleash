var Promise = require('bluebird'),
    dbPool = require('./dbPool');

function storeEvent(event) {
    var sql = 'INSERT INTO events(type, user, data) VALUES ($1, $2, $3)';
    var params = [event.type,event.user,event.data];

    return new Promise(function (resolve, reject) {
        dbPool.query(sql, params, function (err) {
            if (err) {reject(err);}
            resolve();
        });
    });
}


module.exports = {
    store: storeEvent()
};