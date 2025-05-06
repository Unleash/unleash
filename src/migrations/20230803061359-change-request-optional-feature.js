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
            DELETE FROM change_request_events WHERE feature IS NULL;
            ALTER TABLE change_request_events ALTER COLUMN feature SET NOT NULL;
        `,
        callback,
    );
};
