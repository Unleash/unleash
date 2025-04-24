
exports.up = (db, callback) => {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS unknown_flags (
            name TEXT NOT NULL,
            app_name TEXT NOT NULL,
            seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (name, app_name)
        );
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP TABLE IF EXISTS unknown_flags;
        `,
        callback,
    );
};
