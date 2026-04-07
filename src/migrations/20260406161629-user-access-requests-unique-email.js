exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE user_access_requests
        ADD CONSTRAINT user_access_requests_email_key UNIQUE (email);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE user_access_requests
        DROP CONSTRAINT IF EXISTS user_access_requests_email_key;
        `,
        cb,
    );
};
