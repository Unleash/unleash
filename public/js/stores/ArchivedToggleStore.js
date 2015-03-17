var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var Timer           = require('../utils/Timer');
var Server          = require('./FeatureToggleServerFacade');
var filter          = require('lodash/collection/filter');
var sortBy          = require('lodash/collection/sortBy');

var _archivedToggles = [];

// Creates a DataStore
var FeatureStore = Reflux.createStore({
    //The store should be split in two: toggleStore && archivedToggleStore!

  // Initial setup
  init: function() {
    this.listenTo(FeatureActions.archive.completed, this.onArchive);
    this.listenTo(FeatureActions.revive.completed,  this.onRevive);

    this.timer = new Timer(this.loadDataFromServer, 30*1000);
    this.timer.start();
  },

  loadDataFromServer: function() {
    //TODO: this should not be part of the store!
    Server.getArchivedFeatures(function(err, archivedToggles) {
      _archivedToggles = archivedToggles;
      this.trigger();
    }.bind(this));
  },

  onArchive: function(feature) {
    var toggles = _archivedToggles.concat([feature]);
    _archivedToggles = sortBy(toggles, 'name');
    this.trigger();
  },

  onRevive: function(item) {
    var newStore = filter(_archivedToggles, function(f) {
        return f.name !== item.name;
    });

    _archivedToggles = sortBy(newStore, 'name');
    this.trigger();
  },

  getArchivedToggles: function() {
    return _archivedToggles;
  },

  initStore: function(archivedToggles) {
    _archivedToggles = archivedToggles;
  }
});

module.exports = FeatureStore;
