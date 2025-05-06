exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE unleash_session (
            sid varchar PRIMARY KEY,
            sess json NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            expired TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE INDEX idx_unleash_session_expired ON unleash_session(expired);
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX idx_unleash_session_expired;
        DROP TABLE unleash_session;
    `,
        cb,
    );
};
