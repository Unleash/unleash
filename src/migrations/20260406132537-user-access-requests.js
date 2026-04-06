exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS user_access_requests (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT NOT NULL,
            requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc')
        );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS user_access_requests;
        `,
        cb,
    );
};
