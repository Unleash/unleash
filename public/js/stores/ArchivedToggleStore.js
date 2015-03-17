var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var filter          = require('lodash/collection/filter');
var sortBy          = require('lodash/collection/sortBy');

var _archivedToggles = [];

// Creates a DataStore
var FeatureStore = Reflux.createStore({

    // Initial setup
    init: function() {
        this.listenTo(FeatureActions.initArchive.completed, this.onInit);
        this.listenTo(FeatureActions.archive.completed, this.onArchive);
        this.listenTo(FeatureActions.revive.completed,  this.onRevive);

    },

    onInit: function(toggles) {
        _archivedToggles = toggles;
        this.trigger();
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
