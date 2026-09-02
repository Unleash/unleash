exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE login_history
            ADD COLUMN IF NOT EXISTS user_agent TEXT;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE login_history
            DROP COLUMN IF EXISTS user_agent;
    `,
        cb,
    );
};
