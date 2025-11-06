'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS safeguards (
            id TEXT PRIMARY KEY,
            impact_metric_id TEXT NOT NULL REFERENCES impact_metrics (id) ON DELETE CASCADE,
            action JSONB NOT NULL,
            trigger_condition JSONB NOT NULL
        );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS safeguards;
        `,
        cb,
    );
};
