exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_environment_safeguards
            DROP COLUMN IF EXISTS project;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_environment_safeguards
            ADD COLUMN project TEXT;
        `,
        cb,
    );
};
