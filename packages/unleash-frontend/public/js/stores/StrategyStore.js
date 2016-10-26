'use strict';

const Reflux          = require('reflux');
const StrategyActions = require('./StrategyActions');
const filter          = require('lodash/collection/filter');

let _strategies = [];

// Creates a DataStore
const StrategyStore = Reflux.createStore({

    // Initial setup
    init () {
        this.listenTo(StrategyActions.init.completed, this.setStrategies);
        this.listenTo(StrategyActions.create.completed, this.onCreate);
        this.listenTo(StrategyActions.remove.completed,  this.onRemove);
    },

    onCreate (strategy) {
        this.setStrategies(_strategies.concat([strategy]));
    },

    onRemove (strategy) {
        const strategies = filter(_strategies, item => item.name !== strategy.name);
        this.setStrategies(strategies);
    },

    setStrategies (strategies) {
        _strategies = strategies;
        this.trigger(_strategies);
    },

    getStrategies () {
        return _strategies;
    },

    initStore (strategies) {
        _strategies = strategies;
    },
});

module.exports = StrategyStore;
