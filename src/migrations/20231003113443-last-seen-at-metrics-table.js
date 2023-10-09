'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
      CREATE TABLE last_seen_at_metrics (
      feature_name VARCHAR(255),
      environment VARCHAR(100),
      last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
      PRIMARY KEY (feature_name, environment),
      FOREIGN KEY (environment) REFERENCES environments(name) ON DELETE CASCADE
    );

      CREATE INDEX idx_feature_name
      ON last_seen_at_metrics (feature_name);`,
        callback(),
    );
};

exports.down = function (db, callback) {
      db.runSql(
        `DROP TABLE last_seen_at_metrics;
      `,
        callback(),
    );
};
