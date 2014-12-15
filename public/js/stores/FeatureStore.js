var reqwest = require('reqwest');

var FeatureStore = function () {
};

var TYPE         = 'json';
var CONTENT_TYPE = 'application/json';

FeatureStore.prototype = {
    updateFeature: function (feature) {
        return reqwest({
            url: 'features/' + feature.name,
            method: 'put',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature)
        });
    },

    createFeature: function (feature) {
        return reqwest({
            url: 'features',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature)
        });
    },

    archiveFeature: function (feature) {
        return reqwest({
            url: 'features/' + feature.name,
            method: 'delete',
            type: TYPE
        });
    },

    getFeatures: function () {
        return reqwest({
            url: 'features',
            method: 'get',
            type: TYPE
        });
    }
};

module.exports = FeatureStore;
