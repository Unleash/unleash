var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var Server          = require('./FeatureToggleServerFacade');
var Timer           = require('../utils/Timer');

var _featureToggles = [];
var _archivedToggles = [];

// Creates a DataStore
var FeatureStore = Reflux.createStore({
  // Initial setup
  init: function() {
    this.listenTo(FeatureActions.create.completed,  this.onCreate);
    this.listenTo(FeatureActions.update.completed,  this.onUpdate);
    this.listenTo(FeatureActions.archive.completed, this.onArchive);
    this.listenTo(FeatureActions.revive.completed,  this.onRevive);

    this.timer = new Timer(this.loadDataFromServer, 30*1000);
    this.timer.start();
  },

  loadDataFromServer: function() {
    Server.getFeatures(function(err, featureToggles) {
      this.setToggles(featureToggles);
    }.bind(this));

    Server.getArchivedFeatures(function(err, archivedToggles) {
      _archivedToggles = archivedToggles;
      this.trigger();
    }.bind(this));
  },

  onCreate: function(feature) {
      this.setToggles([feature].concat(_featureToggles));
  },

  setToggles: function(toggles) {
    _featureToggles = toggles;
    this.trigger();
  },

  onUpdate: function(feature) {
    var idx;
    _featureToggles.forEach(function(item, i) {
      if(item.name === feature.name) {
        idx = i;
      }
    });
    _featureToggles[idx] = feature;
    this.trigger();
  },

  onArchive: function(feature) {
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

  onRevive: function(item) {
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
