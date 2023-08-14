'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_rejections ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
            ALTER TABLE change_request_approvals ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
            ALTER TABLE change_request_comments ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
            ALTER TABLE change_request_events ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
            ALTER TABLE change_requests ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

        `,
        callback,
    );
};

exports.down = function (db, callback) {
    callback();
};
