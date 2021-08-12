'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS environments (
            name          VARCHAR (100) NOT NULL PRIMARY KEY,
            display_name  VARCHAR (255),
            created_at    timestamp with time zone DEFAULT now()
        );

        INSERT INTO environments(name, display_name) values (':global:', 'Across all environments');

        CREATE TABLE IF NOT EXISTS feature_strategies (
            id            TEXT PRIMARY KEY,
            feature_name  VARCHAR (255) NOT NULL REFERENCES features(name) ON DELETE CASCADE,
            project_name  VARCHAR (255) NOT NULL,
            environment   VARCHAR (100) NOT NULL DEFAULT ':global:' REFERENCES environments(name) ON DELETE CASCADE,
            strategy_name VARCHAR (255) NOT NULL,
            parameters    jsonb,
            constraints   jsonb,
            sort_order    integer NOT NULL DEFAULT 9999,
            created_at    timestamp with time zone DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS feature_environments (
            environment   VARCHAR (100) NOT NULL DEFAULT ':global:' REFERENCES environments(name) ON DELETE CASCADE,
            feature_name  VARCHAR (255) NOT NULL REFERENCES features(name) ON DELETE CASCADE,
            enabled       BOOLEAN NOT NULL,
            PRIMARY KEY (environment, feature_name)

        );
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE feature_strategies;
        DROP TABLE feature_environments;
        DROP TABLE environments;
        `,
        cb,
    );
};
