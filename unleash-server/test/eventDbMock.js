var Promise = require('bluebird');

function storeEvent(event) {
    return new Promise(function (resolve) {
        resolve();
    });
}


module.exports = {
    store: storeEvent
};