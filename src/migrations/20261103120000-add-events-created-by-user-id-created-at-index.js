'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          CREATE INDEX IF NOT EXISTS events_created_by_user_id_created_at_idx
            ON events (created_by_user_id, created_at DESC)
            INCLUDE (feature_name, project, type);
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          DROP INDEX IF EXISTS events_created_by_user_id_created_at_idx;
        `,
        callback,
    );
};
