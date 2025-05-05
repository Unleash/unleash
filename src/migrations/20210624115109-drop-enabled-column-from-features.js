exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            DROP COLUMN enabled;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            ADD COLUMN enabled integer DEFAULT 0;
    `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
