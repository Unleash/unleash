exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_environment_safeguards
            DROP CONSTRAINT IF EXISTS feature_environment_safeguards_project_fkey;

        ALTER TABLE feature_environment_safeguards
            ALTER COLUMN project DROP NOT NULL;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_environment_safeguards
            ALTER COLUMN project SET NOT NULL;

        ALTER TABLE feature_environment_safeguards
            ADD CONSTRAINT feature_environment_safeguards_project_fkey
            FOREIGN KEY (project) REFERENCES projects(id) ON DELETE CASCADE;
        `,
        cb,
    );
};
