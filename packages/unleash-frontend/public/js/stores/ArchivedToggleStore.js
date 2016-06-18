'use strict';
const Reflux          = require('reflux');
const FeatureActions  = require('./FeatureToggleActions');
const filter          = require('lodash/collection/filter');
const sortBy          = require('lodash/collection/sortBy');

let _archivedToggles = [];

// Creates a DataStore
const FeatureStore = Reflux.createStore({

    // Initial setup
    init() {
        this.listenTo(FeatureActions.initArchive.completed, this.onInit);
        this.listenTo(FeatureActions.archive.completed, this.onArchive);
        this.listenTo(FeatureActions.revive.completed,  this.onRevive);
    },

    onInit(toggles) {
        _archivedToggles = toggles;
        this.trigger();
    },

    onArchive(feature) {
        const toggles = _archivedToggles.concat([feature]);
        _archivedToggles = sortBy(toggles, 'name');
        this.trigger();
    },

    onRevive(item) {
        const newStore = filter(_archivedToggles, f => f.name !== item.name);

        _archivedToggles = sortBy(newStore, 'name');
        this.trigger();
    },

    getArchivedToggles() {
        return _archivedToggles;
    },

    initStore(archivedToggles) {
        _archivedToggles = archivedToggles;
    },
});

module.exports = FeatureStore;
