exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_environment_safeguards
            DROP CONSTRAINT IF EXISTS feature_environment_safeguards_environment_feature_name_fkey;

        ALTER TABLE feature_environment_safeguards
            DROP CONSTRAINT IF EXISTS feature_environment_safeguards_feature_name_fkey;

        ALTER TABLE feature_environment_safeguards
            ADD CONSTRAINT feature_environment_safeguards_feature_name_fkey
            FOREIGN KEY (feature_name) REFERENCES features(name) ON DELETE CASCADE;

        ALTER TABLE feature_environment_safeguards
            DROP CONSTRAINT IF EXISTS feature_environment_safeguards_environment_fkey;

        ALTER TABLE feature_environment_safeguards
            ADD CONSTRAINT feature_environment_safeguards_environment_fkey
            FOREIGN KEY (environment) REFERENCES environments(name) ON DELETE CASCADE;

        ALTER TABLE release_plan_safeguards
            DROP CONSTRAINT IF EXISTS release_plan_safeguards_environment_feature_name_fkey;

        ALTER TABLE release_plan_safeguards
            DROP CONSTRAINT IF EXISTS release_plan_safeguards_feature_name_fkey;

        ALTER TABLE release_plan_safeguards
            ADD CONSTRAINT release_plan_safeguards_feature_name_fkey
            FOREIGN KEY (feature_name) REFERENCES features(name) ON DELETE CASCADE;

        ALTER TABLE release_plan_safeguards
            DROP CONSTRAINT IF EXISTS release_plan_safeguards_environment_fkey;

        ALTER TABLE release_plan_safeguards
            ADD CONSTRAINT release_plan_safeguards_environment_fkey
            FOREIGN KEY (environment) REFERENCES environments(name) ON DELETE CASCADE;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_environment_safeguards
            DROP CONSTRAINT IF EXISTS feature_environment_safeguards_environment_fkey;

        ALTER TABLE feature_environment_safeguards
            DROP CONSTRAINT IF EXISTS feature_environment_safeguards_feature_name_fkey;

        ALTER TABLE feature_environment_safeguards
            ADD CONSTRAINT feature_environment_safeguards_environment_feature_name_fkey
            FOREIGN KEY (environment, feature_name)
            REFERENCES feature_environments(environment, feature_name)
            ON DELETE CASCADE;

        ALTER TABLE release_plan_safeguards
            DROP CONSTRAINT IF EXISTS release_plan_safeguards_environment_fkey;

        ALTER TABLE release_plan_safeguards
            DROP CONSTRAINT IF EXISTS release_plan_safeguards_feature_name_fkey;

        ALTER TABLE release_plan_safeguards
            ADD CONSTRAINT release_plan_safeguards_environment_feature_name_fkey
            FOREIGN KEY (environment, feature_name)
            REFERENCES feature_environments(environment, feature_name)
            ON DELETE CASCADE;
        `,
        cb,
    );
};
