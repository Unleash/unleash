'use strict';
const Reflux = require('reflux');
const Server = require('./FeatureToggleServerFacade');

const FeatureToggleActions = Reflux.createActions({
    init: { asyncResult: true },
    initArchive: { asyncResult: true },
    create: { asyncResult: true },
    update: { asyncResult: true },
    archive: { asyncResult: true },
    revive: { asyncResult: true },
});

FeatureToggleActions.init.listen(function() {
    Server.getFeatures((error, features) => {
        if (error) {
            this.failed(error);
        } else {
            this.completed(features);
        }
    });
});

FeatureToggleActions.initArchive.listen(function() {
    Server.getArchivedFeatures((error, archivedToggles) => {
        if (error) {
            this.failed(error);
        } else {
            this.completed(archivedToggles);
        }
    });
});

FeatureToggleActions.create.listen(function(feature) {
    Server.createFeature(feature, error => {
        if (error) {
            this.failed(error);
        } else {
            this.completed(feature);
        }
    });
});

FeatureToggleActions.update.listen(function(feature) {
    Server.updateFeature(feature, error => {
        if (error) {
            this.failed(error);
        } else {
            this.completed(feature);
        }
    });
});

FeatureToggleActions.archive.listen(function(feature) {
    Server.archiveFeature(feature, error => {
        if (error) {
            this.failed(error);
        } else {
            this.completed(feature);
        }
    });
});

FeatureToggleActions.revive.listen(function(feature) {
    Server.reviveFeature(feature, error => {
        if (error) {
            this.failed(error);
        } else {
            this.completed(feature);
        }
    });
});

module.exports = FeatureToggleActions;
