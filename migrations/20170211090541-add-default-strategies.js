/* eslint camelcase: "off" */
'use strict';

const strategies = require('./default-strategies.json');
const async = require('async');

function insertStrategySQL (strategy) {
    return `
        INSERT INTO strategies (name, description, parameters, built_in)
        SELECT '${strategy.name}', '${strategy.description}', '${JSON.stringify(strategy.parameters)}', 1
        WHERE
            NOT EXISTS (
                SELECT name FROM strategies WHERE name = '${strategy.name}'
        );`;
}

function insertEventsSQL (strategy) {
    return `
        INSERT INTO events (type, created_by, data)
        SELECT 'strategy-created', 'migration', '${JSON.stringify(strategy)}'
        WHERE
            NOT EXISTS (
                SELECT name FROM strategies WHERE name = '${strategy.name}'
        );`;
}

exports.up = function (db, callback) {
    const insertStrategies = strategies.map((s) => (cb) => {
        db.runSql(insertEventsSQL(s), cb);
        db.runSql(insertStrategySQL(s), cb);
    });
    async.series(insertStrategies, callback);
};

exports.down = function (db, cb) {
    return cb();
};
