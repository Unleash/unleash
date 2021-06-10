'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
      CREATE TABLE IF NOT EXISTS features_strategies (
        id            serial PRIMARY KEY,
        feature_name  VARCHAR (255) NOT NULL,
        project       VARCHAR (255) NOT NULL,
        enabled       BOOLEAN NOT NULL,
        environment   VARCHAR (100) NOT NULL DEFAULT ':global:',
        strategy_name VARCHAR (255) NOT NULL,
        parameters    json,
        constraints   json,
        created_at    timestamp with time zone DEFAULT now()
      )
  `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        DROP TABLE features_strategies;
    `,
        cb,
    );
};
