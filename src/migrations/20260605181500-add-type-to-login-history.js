exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE login_history
            ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'login';
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE login_history
            DROP COLUMN IF EXISTS type;
    `,
        cb,
    );
};
