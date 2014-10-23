var eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    featuresMock = require('./featuresMock'),
    Promise = require('bluebird');

eventStore.on(eventType.featureCreated, function (event) {
        console.log('feature created event recieved', event);
    }
);

function getFeatures() {
    return Promise.resolve(featuresMock);
}

module.exports = {
    getFeatures: getFeatures
};

