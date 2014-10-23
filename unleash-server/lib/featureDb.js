var eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    featuresMock = require('./featuresMock'),
    logger = require('./logger'),
    Promise = require('bluebird');

eventStore.on(eventType.featureCreated, function (event) {
        logger.info('feature created event recieved', event);
    }
);

function getFeatures() {
    return Promise.resolve(featuresMock);
}

module.exports = {
    getFeatures: getFeatures
};

