'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE jobs
            DROP COLUMN IF EXISTS lease_expires_at,
            DROP COLUMN IF EXISTS attempt_count;`,
        cb,
    );
};
