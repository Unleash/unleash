'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
        `,
        callback,
    );
};
