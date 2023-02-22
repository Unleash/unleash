exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE login_events (
            id TEXT PRIMARY KEY NOT NULL,
            ip INET,
            username TEXT,
            auth_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            successful BOOLEAN NOT NULL,
            failure_reason TEXT
        );
        CREATE INDEX login_events_ip_idx ON login_events(ip);
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX login_events_ip_idx;
        DROP TABLE login_events;
    `,
        cb,
    );
};
