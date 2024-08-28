'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE users ADD COLUMN first_seen_at TIMESTAMP WITHOUT TIME ZONE;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE users DROP COLUMN first_seen_at;
        `,
        cb);
};
