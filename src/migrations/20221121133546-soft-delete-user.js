'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted boolean not null default false;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE users DROP COLUMN IF EXISTS is_deleted;
        `,
        callback,
    );
};
