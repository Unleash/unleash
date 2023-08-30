'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        DROP TABLE IF EXISTS client_metrics_total;

        CREATE TABLE IF NOT EXISTS client_metrics_total (
           feature_name VARCHAR(255) NOT NULL,
           environment VARCHAR(100) NOT NULL,
           total BIGINT NOT NULL,
           PRIMARY KEY(feature_name, environment)
        );
        CREATE INDEX idx_client_metrics_total_f_name ON client_metrics_total(feature_name);
    `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        DROP TABLE IF EXISTS client_metrics_total;
    `,
        callback,
    );
};
