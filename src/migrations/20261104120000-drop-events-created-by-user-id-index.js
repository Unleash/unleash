'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          DROP INDEX IF EXISTS events_created_by_user_id_idx;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          CREATE INDEX IF NOT EXISTS events_created_by_user_id_idx
            ON events (created_by_user_id);
        `,
        callback,
    );
};
