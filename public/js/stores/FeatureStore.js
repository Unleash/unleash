var reqwest = require('reqwest');

var FeatureStore = function () {
};

FeatureStore.TYPE         = 'json';
FeatureStore.CONTENT_TYPE = 'application/json';

FeatureStore.prototype = {
    updateFeature: function (changeRequest) {
        return reqwest({
            url: 'features/' + changeRequest.name,
            method: 'patch',
            type: FeatureStore.TYPE,
            contentType: FeatureStore.CONTENT_TYPE,
            data: JSON.stringify(changeRequest)
        });
    },

    createFeature: function (feature) {
        return reqwest({
            url: 'features',
            method: 'post',
            type: FeatureStore.TYPE,
            contentType: FeatureStore.CONTENT_TYPE,
            data: JSON.stringify(feature)
        });
    },

    getFeatures: function () {
        return reqwest({
            url: 'features',
            method: 'get',
            type: FeatureStore.TYPE
        });
    }
};

module.exports = FeatureStore;
