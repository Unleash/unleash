'use strict';
const Reflux          = require('reflux');
const FeatureActions  = require('./FeatureToggleActions');
const filter          = require('lodash/collection/filter');
const sortBy          = require('lodash/collection/sortBy');
const findIndex       = require('lodash/array/findIndex');

let _featureToggles = [];

const FeatureStore = Reflux.createStore({

  // Initial setup
    init() {
        this.listenTo(FeatureActions.init.completed,    this.setToggles);
        this.listenTo(FeatureActions.create.completed,  this.onCreate);
        this.listenTo(FeatureActions.update.completed,  this.onUpdate);
        this.listenTo(FeatureActions.archive.completed, this.onArchive);
        this.listenTo(FeatureActions.revive.completed,  this.onRevive);
    },

    onCreate(feature) {
        this.setToggles([feature].concat(_featureToggles));
    },

    setToggles(toggles) {
        _featureToggles = sortBy(toggles, 'name');
        this.trigger();
    },

    onUpdate(feature) {
        const idx = findIndex(_featureToggles, 'name', feature.name);
        _featureToggles[idx] = feature;
        this.trigger();
    },

    onArchive(feature) {
        const featureToggles = filter(_featureToggles, item => item.name !== feature.name);
        this.setToggles(featureToggles);
        this.trigger();
    },

    onRevive(item) {
        this.setToggles(_featureToggles.concat([item]));
        this.trigger();
    },

    getFeatureToggles() {
        return _featureToggles;
    },

    initStore(toggles) {
        _featureToggles = toggles;
    }
});

module.exports = FeatureStore;
