var Reflux = require("reflux");
var Server = require('./FeatureToggleServerFacade');

var FeatureToggleActions = Reflux.createActions({
    'create':   { asyncResult: true },
    'update':   { asyncResult: true },
    'archive':  { asyncResult: true },
    'revive':   { asyncResult: true }
});

FeatureToggleActions.create.listen(function(feature){
    Server.createFeature(feature, function(error) {
      if(error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

FeatureToggleActions.update.listen(function(feature){
    Server.updateFeature(feature, function(error) {
      if(error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

FeatureToggleActions.archive.listen(function(feature){
    Server.archiveFeature(feature, function(error) {
      if(error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

FeatureToggleActions.revive.listen(function(feature){
    Server.reviveFeature(feature, function(error) {
      if(error) {
        this.failed(error);
      } else {
        this.completed(feature);
    }
    }.bind(this));
});

module.exports = FeatureToggleActions;
