'use strict';
const Reflux = require('reflux');
const StrategyAPI = require('./StrategyAPI');

const StrategyActions = Reflux.createActions({
    init: { asyncResult: true },
    create: { asyncResult: true },
    remove: { asyncResult: true },
});

StrategyActions.init.listen(function () {
    StrategyAPI.getStrategies((err, strategies) => {
        if (err) {
            this.failed(err);
        } else {
            this.completed(strategies);
        }
    });
});

StrategyActions.create.listen(function (feature) {
    StrategyAPI.createStrategy(feature, err => {
        if (err) {
            this.failed(err);
        } else {
            this.completed(feature);
        }
    });
});

StrategyActions.remove.listen(function (feature) {
    StrategyAPI.removeStrategy(feature, err => {
        if (err) {
            this.failed(err);
        } else {
            this.completed(feature);
        }
    });
});

module.exports = StrategyActions;
