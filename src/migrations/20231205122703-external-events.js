exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER table events
                ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER table events
                DROP COLUMN is_external
        `,
        cb,
    );
};
