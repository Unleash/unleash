var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var Server          = require('./FeatureToggleServerFacade');
var Timer           = require('../utils/Timer');
var filter          = require('lodash/collection/filter');
var sortBy          = require('lodash/collection/sortBy');
var findIndex       = require('lodash/array/findIndex');

//TODO: have archived toggles in seperate store.
var _featureToggles = [];
var _archivedToggles = [];

// Creates a DataStore
var FeatureStore = Reflux.createStore({
    //The store should be split in two: toggleStore && archivedToggleStore!

  // Initial setup
  init: function() {
    this.listenTo(FeatureActions.create.completed,  this.onCreate);
    this.listenTo(FeatureActions.update.completed,  this.onUpdate);
    this.listenTo(FeatureActions.archive.completed, this.onArchive);
    this.listenTo(FeatureActions.revive.completed,  this.onRevive);

    //TODO: this should not be part of the store!
    this.timer = new Timer(this.loadDataFromServer, 30*1000);
    this.timer.start();
  },

  loadDataFromServer: function() {
    //TODO: this should not be part of the store!
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
    _featureToggles = sortBy(toggles, 'name');
    this.trigger();
  },

  onUpdate: function(feature) {
    var idx = findIndex(_featureToggles, 'name', feature.name);
    _featureToggles[idx] = feature;
    this.trigger();
  },

  onArchive: function(feature) {
    var featureToggles = filter(_featureToggles, function(item) {
        return item.name !== feature.name;
    });
    _archivedToggles.unshift(feature);
    this.setToggles(featureToggles);
    this.trigger();
  },

  onRevive: function(item) {
    var newStore = _archivedToggles.filter(function(f) {
        return f.name !== item.name;
    });
    _archivedToggles = newStore;
    this.setToggles(_featureToggles.concat([item]));
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
