'use strict';

const async = require('async');
const strategies = require('./default-strategies.json');

function insertStrategySQL(strategy) {
    return `
        INSERT INTO strategies (name, description, parameters, built_in)
        SELECT '${strategy.name}', '${strategy.description}', '${JSON.stringify(
        strategy.parameters,
    )}', 1
        WHERE
            NOT EXISTS (
                SELECT name FROM strategies WHERE name = '${strategy.name}'
        );`;
}

function insertEventsSQL(strategy) {
    return `
        INSERT INTO events (type, created_by, data)
        SELECT 'strategy-created', 'migration', '${JSON.stringify(strategy)}'
        WHERE
            NOT EXISTS (
                SELECT name FROM strategies WHERE name = '${strategy.name}'
        );`;
}

function removeEventsSQL(strategy) {
    return `
        INSERT INTO events (type, created_by, data)
        SELECT 'strategy-deleted', 'migration', '${JSON.stringify(strategy)}'
        WHERE
            EXISTS (
                SELECT name FROM strategies WHERE name = '${
                    strategy.name
                }' AND built_in = 1
        );`;
}

function removeStrategySQL(strategy) {
    return `
        DELETE FROM strategies
        WHERE name = '${strategy.name}' AND built_in = 1`;
}

exports.up = function (db, callback) {
    const insertStrategies = strategies.map((s) => (cb) => {
        async.series(
            [
                db.runSql.bind(db, insertEventsSQL(s)),
                db.runSql.bind(db, insertStrategySQL(s)),
            ],
            cb,
        );
    });
    async.series(insertStrategies, callback);
};

exports.down = function (db, callback) {
    const removeStrategies = strategies
        .filter((s) => s.name !== 'default')
        .map((s) => (cb) => {
            async.series(
                [
                    db.runSql.bind(db, removeEventsSQL(s)),
                    db.runSql.bind(db, removeStrategySQL(s)),
                ],
                cb,
            );
        });

    async.series(removeStrategies, callback);
};
