'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS client_metrics_env_performance(
                 app_name VARCHAR(255),
                 environment VARCHAR(100),
                 timestamp TIMESTAMP WITH TIME ZONE,
                 memory_total numeric,
                 heap_total numeric,
                 heap_used numeric,
                 external_memory numeric,
                 cpu numeric,
                 PRIMARY KEY(
                     app_name, environment,
                     timestamp
                 )
            );

        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS client_metrics_env_performance;
        `,
        callback,
    );
};
