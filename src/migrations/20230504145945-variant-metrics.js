'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS client_metrics_env_variants (
               feature_name VARCHAR(255),
               app_name VARCHAR(255),
               environment VARCHAR(100),
               timestamp TIMESTAMP WITH TIME ZONE,
               variant text,
               count INTEGER DEFAULT 0,
               FOREIGN KEY (
                            feature_name, app_name, environment,
                            timestamp
                   ) REFERENCES client_metrics_env (
                                                    feature_name, app_name, environment,
                                                    timestamp
                   ) ON UPDATE CASCADE ON DELETE CASCADE,
               PRIMARY KEY(
                           feature_name, app_name, environment,
                           timestamp, variant
                   )
            );

        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS client_metrics_env_variants;
        `,
        callback,
    );
};
