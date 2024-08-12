'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        CREATE INDEX idx_events_created_at_desc ON events (created_at DESC);
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_events_created_at_desc;
        `,
        callback,
    );
};
