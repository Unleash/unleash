'use strict';
const reqwest = require('reqwest');

const TYPE         = 'json';
const CONTENT_TYPE = 'application/json';

const StrategyAPI = {
    createStrategy (strategy, cb) {
        reqwest({
            url: 'strategies',
            method: 'post',
            type: TYPE,
            contentType: CONTENT_TYPE,
            data: JSON.stringify(strategy),
            error (error) {
                cb(error);
            },
            success () {
                cb(null, strategy);
            },
        });
    },

    removeStrategy (strategy, cb) {
        reqwest({
            url: `strategies/${strategy.name}`,
            method: 'delete',
            type: TYPE,
            error (error) {
                cb(error);
            },
            success () {
                cb(null, strategy);
            },
        });
    },

    getStrategies (cb) {
        reqwest({
            url: 'strategies',
            method: 'get',
            type: TYPE,
            error (error) {
                cb(error);
            },
            success (data) {
                cb(null, data.strategies);
            },
        });
    },
};

module.exports = StrategyAPI;
