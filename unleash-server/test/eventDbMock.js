var Promise = require('bluebird');

function storeEvent(event) {
    console.log('using eventDbMock to store: ', event);
    return new Promise(function (resolve) {
        resolve();
    });
}


module.exports = {
    store: storeEvent
};