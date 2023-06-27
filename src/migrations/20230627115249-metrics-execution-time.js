'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE client_metrics_env ADD COLUMN IF NOT EXISTS enabled_execution_time bigint;
            ALTER TABLE client_metrics_env ADD COLUMN IF NOT EXISTS disabled_execution_time bigint;
            ALTER TABLE client_metrics_env ADD COLUMN IF NOT EXISTS enabled_execution_count bigint;
            ALTER TABLE client_metrics_env ADD COLUMN IF NOT EXISTS disabled_execution_count bigint;
            ALTER TABLE client_metrics_env ADD COLUMN IF NOT EXISTS enabled_error_count bigint;
            ALTER TABLE client_metrics_env ADD COLUMN IF NOT EXISTS disabled_error_count bigint;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE client_metrics_env DROP COLUMN enabled_execution_time;
            ALTER TABLE client_metrics_env DROP COLUMN disabled_execution_time;
            ALTER TABLE client_metrics_env DROP COLUMN enabled_execution_count;
            ALTER TABLE client_metrics_env DROP COLUMN disabled_execution_count;
            ALTER TABLE client_metrics_env DROP COLUMN enabled_error_count;
            ALTER TABLE client_metrics_env DROP COLUMN disabled_error_count;
        `,
        cb,
    );
};
