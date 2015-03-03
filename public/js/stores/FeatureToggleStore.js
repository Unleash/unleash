var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var Server          = require('./FeatureToggleServerFacade');

var _featureToggles = [];
var _archivedToggles = [];

// Creates a DataStore
var FeatureStore = Reflux.createStore({
  // Initial setup
  init: function() {
    this.listenTo(FeatureActions.create,  this.onCreate);
    this.listenTo(FeatureActions.update,  this.onUpdate);
    this.listenTo(FeatureActions.archive, this.onArchive);
    this.listenTo(FeatureActions.revive,  this.onRevive);

    Server.getFeatures(function(err, featureToggles) {
      this.setToggles(featureToggles);
    }.bind(this));

    Server.getArchivedFeatures(function(err, archivedToggles) {
      _archivedToggles = archivedToggles;
      this.trigger();
    }.bind(this));
  },

  onCreate: function(feature) {
    Server.createFeature(feature, function(error) {
      if(error) {
        FeatureActions.create.failed(error);
      } else {
        this.setToggles([feature].concat(_featureToggles));
        FeatureActions.create.completed();
      }
    }.bind(this));
  },

  onArchive: function(feature) {
    Server.archiveFeature(feature, function(error) {
      if(error) {
        FeatureActions.archive.failed(error);
      } else {
        this.archiveToggle(feature);
        FeatureActions.archive.completed();
      }
    }.bind(this));
  },

  onUpdate: function(feature) {
    Server.updateFeature(feature, function(error) {
      if(error) {
        FeatureActions.update.failed(error);
      } else {
        this.updateToggle(feature);
        FeatureActions.update.completed();
      }
    }.bind(this));
  },

  onRevive: function(feature) {
    Server.reviveFeature(feature, function(error) {
      if(error) {
        FeatureActions.revive.failed(error);
      } else {
        this.revive(feature);
        FeatureActions.revive.completed();
      }
    }.bind(this));
  },

  setToggles: function(toggles) {
    _featureToggles = toggles;
    this.trigger();
  },

  updateToggle: function(feature) {
    var idx;
    _featureToggles.forEach(function(item, i) {
      if(item.name === feature.name) {
        idx = i;
      }
    });
    _featureToggles[idx] = feature;
    this.trigger();
  },

  archiveToggle: function(feature) {
    var idx;
    _featureToggles.forEach(function(item, i) {
      if(item.name === feature.name) {
        idx = i;
      }
    });
    _featureToggles.splice(idx, 1);
    _archivedToggles.unshift(feature);
    this.trigger();
  },

  revive: function(item) {
    var newStore = _archivedToggles.filter(function(f) {
        return f.name !== item.name;
    });
    _archivedToggles = newStore;
    _featureToggles.push(item);
    this.trigger();
  },

  getFeatureToggles: function() {
    return _featureToggles;
  },

  getArchivedToggles: function() {
    return _archivedToggles;
  },

  initStore: function(toggles, archivedToggles) {
    _featureToggles = toggles;
    _archivedToggles = archivedToggles;
  }
});

module.exports = FeatureStore;
