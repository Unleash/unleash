'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_events ALTER COLUMN feature DROP NOT NULL;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            UPDATE change_request_events SET feature = 'unknown' WHERE feature IS NULL;
            ALTER TABLE change_request_events ALTER COLUMN feature SET NOT NULL;
        `,
        callback,
    );
};
