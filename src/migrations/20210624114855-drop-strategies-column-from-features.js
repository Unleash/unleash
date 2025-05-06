exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            DROP COLUMN strategies;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            ADD COLUMN strategies json;
    `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
