'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE client_metrics_env
        ALTER COLUMN yes TYPE BIGINT,
        ALTER COLUMN no TYPE BIGINT;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE client_metrics_env
        ALTER COLUMN yes TYPE INTEGER,
        ALTER COLUMN no TYPE INTEGER;
        `,
        cb,
    );
};
