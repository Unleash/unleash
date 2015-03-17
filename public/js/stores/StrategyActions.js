var Reflux = require("reflux");
var StrategyAPI = require('./StrategyAPI');

var StrategyActions = Reflux.createActions({
    'create':   { asyncResult: true },
    'remove':   { asyncResult: true },
});

StrategyActions.create.listen(function(feature){
    StrategyAPI.createStrategy(feature, function(err) {
        if(err) {
            this.failed(err);
        } else {
            this.completed(feature);
        }
    }.bind(this));
});

StrategyActions.remove.listen(function(feature){
    StrategyAPI.removeStrategy(feature, function(err) {
        if(err) {
            this.failed(err);
        } else {
            this.completed(feature);
        }
    }.bind(this));
});

module.exports = StrategyActions;
