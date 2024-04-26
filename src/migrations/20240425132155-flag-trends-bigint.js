exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE flag_trends ALTER COLUMN total_yes TYPE bigint;
        ALTER TABLE flag_trends ALTER COLUMN total_no TYPE bigint;
    `, cb);
};

exports.down = function (db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
