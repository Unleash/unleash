'use strict';
const FeatureToggleActions = require('./FeatureToggleActions');
const StrategyActions = require('./StrategyActions');
const Timer = require('../utils/Timer');

let _timer;

function load() {
    FeatureToggleActions.init.triggerPromise();
    StrategyActions.init.triggerPromise();
    FeatureToggleActions.initArchive.triggerPromise();
}

module.exports = function(pollInterval) {
    const intervall = pollInterval || 30;
    _timer = new Timer(load, intervall*1000);
    _timer.start();
};
