exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE events
            ADD COLUMN IF NOT EXISTS user_agent TEXT;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE events
            DROP COLUMN IF EXISTS user_agent;
    `,
        cb,
    );
};
