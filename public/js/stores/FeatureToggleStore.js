var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var filter          = require('lodash/collection/filter');
var sortBy          = require('lodash/collection/sortBy');
var findIndex       = require('lodash/array/findIndex');

var _featureToggles = [];

var FeatureStore = Reflux.createStore({

  // Initial setup
  init: function() {
    this.listenTo(FeatureActions.init.completed,    this.setToggles);
    this.listenTo(FeatureActions.create.completed,  this.onCreate);
    this.listenTo(FeatureActions.update.completed,  this.onUpdate);
    this.listenTo(FeatureActions.archive.completed, this.onArchive);
    this.listenTo(FeatureActions.revive.completed,  this.onRevive);
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
    this.setToggles(featureToggles);
    this.trigger();
  },

  onRevive: function(item) {
    this.setToggles(_featureToggles.concat([item]));
    this.trigger();
  },

  getFeatureToggles: function() {
    return _featureToggles;
  },

  initStore: function(toggles) {
    _featureToggles = toggles;
  }
});

module.exports = FeatureStore;
