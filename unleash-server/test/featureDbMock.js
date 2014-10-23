var Promise = require("bluebird");

var features = [
    {
        "name": "featureX",
        "description": "the #1 feature",
        "enabled": true,
        "strategy": "default"
    },
    {
        "name": "featureY",
        "description": "soon to be the #1 feature",
        "enabled": false,
        "strategy": "baz",
        "parameters": {
            "foo": "bar"
        }
    },
    {
        "name": "featureZ",
        "description": "terrible feature",
        "enabled": true,
        "strategy": "baz",
        "parameters": {
            "foo": "rab"
        }
    }
];

function getFeature(name) {
    var featureFound;
    features.forEach(function (feature) {
        if (feature.name === name) {
            featureFound = feature;
        }
    });

    return featureFound;
}

module.exports = {
    getFeatures: function() {
        return new Promise(function (resolve) {
            resolve(features);
        });
    },
    getFeature: function(name) {
        var feature = getFeature(name);
        if(feature) {
            return Promise.resolve(feature);
        } else {
            return Promise.reject("feature not found");
        }
    }
};