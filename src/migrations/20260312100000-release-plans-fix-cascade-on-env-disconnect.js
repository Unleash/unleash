exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE release_plan_definitions
            DROP CONSTRAINT IF EXISTS feature_environments_fkey;

        ALTER TABLE release_plan_definitions
            ADD CONSTRAINT release_plan_definitions_feature_name_fkey
            FOREIGN KEY (feature_name) REFERENCES features(name) ON DELETE CASCADE;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE release_plan_definitions
            DROP CONSTRAINT IF EXISTS release_plan_definitions_feature_name_fkey;

        ALTER TABLE release_plan_definitions
            ADD CONSTRAINT feature_environments_fkey
            FOREIGN KEY (environment, feature_name)
            REFERENCES feature_environments(environment, feature_name)
            ON DELETE CASCADE;
        `,
        cb,
    );
};
