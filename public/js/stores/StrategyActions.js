var Reflux = require("reflux");
var StrategyAPI = require('./StrategyAPI');

var StrategyActions = Reflux.createActions({
    'init': { asyncResult: true },
    'create': { asyncResult: true },
    'remove': { asyncResult: true },
});

StrategyActions.init.listen(function() {
    StrategyAPI.getStrategies(function(err, strategies) {
        if (err) {
            this.failed(err);
        } else {
            this.completed(strategies);
        }
    }.bind(this));
});

StrategyActions.create.listen(function(feature) {
    StrategyAPI.createStrategy(feature, function(err) {
        if (err) {
            this.failed(err);
        } else {
            this.completed(feature);
        }
    }.bind(this));
});

StrategyActions.remove.listen(function(feature) {
    StrategyAPI.removeStrategy(feature, function(err) {
        if (err) {
            this.failed(err);
        } else {
            this.completed(feature);
        }
    }.bind(this));
});

module.exports = StrategyActions;
