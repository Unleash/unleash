exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER table users
                ADD COLUMN IF NOT EXISTS is_service boolean DEFAULT false
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER table users
                DROP COLUMN is_service
  `,
        cb,
    );
};
