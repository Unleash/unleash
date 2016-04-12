var Reflux = require("reflux");
var Server = require('./FeatureToggleServerFacade');

var FeatureToggleActions = Reflux.createActions({
    'init': { asyncResult: true },
    'initArchive': { asyncResult: true },
    'create': { asyncResult: true },
    'update': { asyncResult: true },
    'archive': { asyncResult: true },
    'revive': { asyncResult: true }
});

FeatureToggleActions.init.listen(function() {
    Server.getFeatures(function(error, features) {
      if (error) {
        this.failed(error);
      } else {
        this.completed(features);
    }
    }.bind(this));
});

FeatureToggleActions.initArchive.listen(function() {
    Server.getArchivedFeatures(function(error, archivedToggles) {
      if (error) {
        this.failed(error);
      } else {
        this.completed(archivedToggles);
    }
    }.bind(this));
});

FeatureToggleActions.create.listen(function(feature) {
    Server.createFeature(feature, function(error) {
      if (error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

FeatureToggleActions.update.listen(function(feature) {
    Server.updateFeature(feature, function(error) {
      if (error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

FeatureToggleActions.archive.listen(function(feature) {
    Server.archiveFeature(feature, function(error) {
      if (error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

FeatureToggleActions.revive.listen(function(feature) {
    Server.reviveFeature(feature, function(error) {
      if (error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

module.exports = FeatureToggleActions;
