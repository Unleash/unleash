'use strict';
const reqwest = require('reqwest');

const TYPE         = 'json';
const CONTENT_TYPE = 'application/json';

const FeatureToggleServerFacade = {
    updateFeature(feature, cb) {
        reqwest({
            url: `features/${feature.name}`,
            method: 'put',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature),
            error(error) {
                cb(error);
            },
            success() {
                cb();
            }
        });
    },

    createFeature(feature, cb) {
        reqwest({
            url: 'features',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature),
            error(error) {
                cb(error);
            },
            success() {
                cb();
            }
        });
    },

    archiveFeature(feature, cb) {
        reqwest({
            url: `features/${feature.name}`,
            method: 'delete',
            type: TYPE,
            error(error) {
                cb(error);
            },
            success() {
                cb();
            }
        });
    },

    getFeatures(cb) {
        reqwest({
            url: 'features',
            method: 'get',
            type: TYPE,
            error(error) {
                cb(error);
            },
            success(data) {
                cb(null, data.features);
            }
        });
    },

    getArchivedFeatures(cb) {
        reqwest({
            url: 'archive/features',
            method: 'get',
            type: TYPE,
            error(error) {
                cb(error);
            },
            success(data) {
                cb(null, data.features);
            }
        });
    },

    reviveFeature(feature, cb) {
        reqwest({
            url: 'archive/revive',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(feature),
            error(error) {
                cb(error);
            },
            success() {
                cb();
            }
        });
    }
};

module.exports = FeatureToggleServerFacade;
