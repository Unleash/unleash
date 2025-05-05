'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE group_user DROP COLUMN IF EXISTS role;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE group_user ADD COLUMN role text check(role in ('Owner', 'Member')) default 'Member';
    `,
        cb,
    );
};
