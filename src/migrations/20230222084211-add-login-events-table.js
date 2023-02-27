exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS login_events (
            id SERIAL PRIMARY KEY NOT NULL,
            username TEXT NOT NULL,
            auth_type TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            successful BOOLEAN NOT NULL,
            ip INET,
            failure_reason TEXT
        );
        CREATE INDEX IF NOT EXISTS login_events_ip_idx ON login_events(ip);
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS login_events_ip_idx;
        DROP TABLE IF EXISTS login_events;
    `,
        cb,
    );
};
