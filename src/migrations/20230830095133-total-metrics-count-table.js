'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        DROP TABLE IF EXISTS client_total_metrics;

        CREATE TABLE IF NOT EXISTS client_total_metrics (
           feature_name VARCHAR(255) NOT NULL,
           environment VARCHAR(100) NOT NULL,
           total BIGINT NOT NULL,
           PRIMARY KEY(feature_name, environment)
        );
        CREATE INDEX idx_client_total_metrics_f_name ON client_total_metrics(feature_name);
    `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        DROP TABLE IF EXISTS client_total_metrics;
    `,
        callback,
    );
};
