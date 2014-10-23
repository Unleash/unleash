var Promise = require('bluebird');
var featuresMock = require('./featuresMock');

function getFeature(name) {
    var featureFound;
    featuresMock.forEach(function (feature) {
        if (feature.name === name) {
            featureFound = feature;
        }
    });

    return Promise.resolve(featureFound);
}

function getFeatures() {
    return Promise.resolve(featuresMock);
}

function addFeature(feature) {
    featuresMock.push(feature);
    return Promise.resolve();
}

module.exports = {
    getFeature: getFeature,
    getFeatures: getFeatures,
    addFeature: addFeature
};