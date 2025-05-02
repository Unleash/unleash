'use strict';

import async from 'async';
const strategies = [
    {
      "name": "default",
      "description": "Default on/off strategy.",
      "parameters": []
    },
    {
      "name": "userWithId",
      "description": "Active for users with a userId defined in the userIds-list",
      "parameters": [
        {
          "name": "userIds",
          "type": "list",
          "description": "",
          "required": false
        }
      ]
    },
    {
      "name": "applicationHostname",
      "description": "Active for client instances with a hostName in the hostNames-list.",
      "parameters": [
        {
          "name": "hostNames",
          "type": "list",
          "description": "List of hostnames to enable the feature toggle for.",
          "required": false
        }
      ]
    },
    {
      "name": "remoteAddress",
      "description": "Active for remote addresses defined in the IPs list.",
      "parameters": [
        {
          "name": "IPs",
          "type": "list",
          "description": "List of IPs to enable the feature toggle for.",
          "required": true
        }
      ]
    }
  ]
;  

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

export async function up(db, callback) {
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

export async function down(db, callback) {
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
