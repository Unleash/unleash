var FeatureToggleActions = require('./FeatureToggleActions');
var StrategyActions = require('./StrategyActions');
var Timer = require('../utils/Timer');

var _timer;

function load() {
    FeatureToggleActions.init.triggerPromise();
    StrategyActions.init.triggerPromise();
    FeatureToggleActions.initArchive.triggerPromise();
}

module.exports = function(pollInterval) {
    var intervall = pollInterval || 30;
    _timer = new Timer(load, intervall*1000);
    _timer.start();
};
