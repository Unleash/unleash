var reqwest = require('reqwest');

var TYPE         = 'json';
var CONTENT_TYPE = 'application/json';

var StrategyStore = {
    createStrategy: function (strategy) {
        return reqwest({
            url: 'strategies',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(strategy)
        });
    },

    removeStrategy: function (strategy) {
        return reqwest({
            url: 'strategies/'+strategy.name,
            method: 'delete',
            type: TYPE
        });
    },

    getStrategies: function () {
        return reqwest({
            url: 'strategies',
            method: 'get',
            type: TYPE
        });
    }
};

module.exports = StrategyStore;
