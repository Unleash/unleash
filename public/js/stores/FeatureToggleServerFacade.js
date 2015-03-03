var reqwest = require('reqwest');

var TYPE         = 'json';
var CONTENT_TYPE = 'application/json';

var FeatureToggleServerFacade = {
    updateFeature: function (feature, cb) {
        reqwest({
            url: 'features/' + feature.name,
            method: 'put',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature),
            error: function(error) {
              cb(error);
            },
            success: function() {
              cb();
            }
        });
    },

    createFeature: function (feature, cb) {
        reqwest({
            url: 'features',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature),
            error: function(error) {
              cb(error);
            },
            success: function() {
              cb();
            }
        });
    },

    archiveFeature: function(feature, cb) {
        reqwest({
            url: 'features/' + feature.name,
            method: 'delete',
            type: TYPE,
            error: function(error) {
              cb(error);
            },
            success: function() {
              cb();
            }
        });
    },

    getFeatures: function(cb) {
        reqwest({
            url: 'features',
            method: 'get',
            type: TYPE,
            error: function(error) {
              cb(error);
            },
            success: function(data) {
              cb(null, data.features);
            }
        });
    },

    getArchivedFeatures: function(cb) {
        reqwest({
            url: 'archive/features',
            method: 'get',
            type: TYPE,
            error: function(error) {
              cb(error);
            },
            success: function(data) {
              cb(null, data.features);
            }
        });
    },

    reviveFeature: function (feature, cb) {
        reqwest({
            url: 'archive/revive',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature),
            error: function(error) {
              cb(error);
            },
            success: function() {
              cb();
            }
        });
    }
};

module.exports = FeatureToggleServerFacade;
