exports.up = function (db, cb) {
    // TODO: foreign key on env.
    db.runSql(
        `
      CREATE TABLE client_metrics_env(
        feature_name  VARCHAR(255),
        app_name      VARCHAR(255),
        environment   VARCHAR(100),
        timestamp     TIMESTAMP WITH TIME ZONE,
        yes           INTEGER DEFAULT 0,
        no            INTEGER DEFAULT 0,
        PRIMARY KEY (feature_name, app_name, environment, timestamp)
      );
      CREATE INDEX idx_client_metrics_f_name ON client_metrics_env(feature_name);

  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE client_metrics_env;
        `,
        cb,
    );
};
