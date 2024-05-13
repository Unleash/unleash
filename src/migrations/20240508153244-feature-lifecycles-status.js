exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE feature_lifecycles ADD COLUMN IF NOT EXISTS status TEXT;
        ALTER TABLE feature_lifecycles ADD COLUMN IF NOT EXISTS status_value TEXT;
    `, cb);
};

exports.down = function (db, cb) {
    db.runSql(
        `
         ALTER TABLE feature_lifecycles DROP COLUMN IF EXISTS status;
         ALTER TABLE feature_lifecycles DROP COLUMN IF EXISTS status_value;
        `,
        cb,
    );
};
