exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS seat_type TEXT;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE users DROP COLUMN IF EXISTS seat_type;`,
        cb,
    );
};
