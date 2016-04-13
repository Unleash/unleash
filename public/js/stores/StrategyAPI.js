var reqwest = require('reqwest');

var TYPE         = 'json';
var CONTENT_TYPE = 'application/json';

var StrategyAPI = {
    createStrategy: function (strategy, cb) {
        reqwest({
            url: 'strategies',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(strategy),
            error: function(error) {
                cb(error);
            },
            success: function() {
                cb(null, strategy);
            }
        });
    },

    removeStrategy: function (strategy, cb) {
        reqwest({
            url: 'strategies/'+strategy.name,
            method: 'delete',
            type: TYPE,
            error: function(error) {
                cb(error);
            },
            success: function() {
                cb(null, strategy);
            }
        });
    },

    getStrategies: function (cb) {
        reqwest({
            url: 'strategies',
            method: 'get',
            type: TYPE,
            error: function(error) {
                cb(error);
            },
            success: function(data) {
                cb(null, data.strategies);
            }
        });
    }
};

module.exports = StrategyAPI;
