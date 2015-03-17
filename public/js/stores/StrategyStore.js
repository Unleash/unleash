var Reflux          = require('reflux');
var ErrorActions    = require('./ErrorActions');
var StrategyActions = require('./StrategyActions');
var StrategyAPI     = require('./StrategyAPI');
var filter          = require('lodash/collection/filter');

var _strategies = [];

// Creates a DataStore
var StrategyStore = Reflux.createStore({

    // Initial setup
    init: function() {
        this.listenTo(StrategyActions.create.completed, this.onCreate);
        this.listenTo(StrategyActions.remove.completed,  this.onRemove);
        this.loadDataFromServer();
    },

    loadDataFromServer: function() {
        //TODO: this should not be part of the store!
        StrategyAPI.getStrategies(function(err, strategies) {

            if(err) {
                ErrorActions.error(err);
                return;
            } else {
                this.setStrategies(strategies);
            }
        }.bind(this));
    },

    onCreate: function(strategy) {
        this.setStrategies(_strategies.concat([strategy]));
    },

    onRemove: function(strategy) {
        var strategies = filter(_strategies, function(item) {
            return item.name !== strategy.name;
        });
        this.setStrategies(strategies);
    },

    setStrategies: function(strategies) {
        _strategies = strategies;
        this.trigger(_strategies);
    },

    getStrategies: function() {
        return _strategies;
    },

    initStore: function(strategies) {
        _strategies = strategies;
    }
});

module.exports = StrategyStore;
