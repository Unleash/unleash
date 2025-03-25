'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE environments ADD COLUMN required_approvals INTEGER;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_settings DROP COLUMN IF EXISTS required_approvals;
        `,
        callback,
    );
};
