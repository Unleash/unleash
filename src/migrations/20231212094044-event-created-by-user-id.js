'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE events DROP COLUMN IF EXISTS created_by_user_id;
        `,
        callback,
    );
};
