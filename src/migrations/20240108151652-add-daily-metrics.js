exports.up = function (db, cb) {
    db.runSql(
        `
      CREATE TABLE IF NOT EXISTS client_metrics_env_daily (
               feature_name  VARCHAR(255),
               app_name      VARCHAR(255),
               environment   VARCHAR(100),
               date          DATE,
               yes           INTEGER DEFAULT 0,
               no            INTEGER DEFAULT 0,
               PRIMARY KEY (feature_name, app_name, environment, date)
      );
      CREATE TABLE IF NOT EXISTS client_metrics_env_variants_daily (
               feature_name  VARCHAR(255),
               app_name      VARCHAR(255),
               environment   VARCHAR(100),
               date          DATE,
               variant       TEXT,
               count         INTEGER DEFAULT 0,
               FOREIGN KEY (
                            feature_name, app_name, environment,
                            date
                   ) REFERENCES client_metrics_env_daily (
                                                    feature_name, app_name, environment,
                                                    date
                   ) ON UPDATE CASCADE ON DELETE CASCADE,
               PRIMARY KEY(
                           feature_name, app_name, environment,
                           date, variant
                   )
            );
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE client_metrics_env_variants_daily;
        DROP TABLE client_metrics_env_daily;
        `,
        cb,
    );
};
