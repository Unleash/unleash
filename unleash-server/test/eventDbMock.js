var Promise = require('bluebird');

function storeEvent() {
    return new Promise(function (resolve) {
        resolve();
    });
}


module.exports = {
    store: storeEvent
};