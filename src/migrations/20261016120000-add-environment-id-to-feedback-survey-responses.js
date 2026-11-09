exports.up = function (db, cb) {
    db.runSql(
        `
        DELETE FROM feedback_survey_responses;
        ALTER TABLE feedback_survey_responses ADD COLUMN environment_id VARCHAR(100) NOT NULL;
        ALTER TABLE feedback_survey_responses
            ADD CONSTRAINT feedback_survey_responses_environment_id_fkey
            FOREIGN KEY (environment_id) REFERENCES environments(name) ON DELETE CASCADE;
        ALTER TABLE feedback_survey_responses
            ADD CONSTRAINT feedback_survey_responses_feature_name_fkey
            FOREIGN KEY (feature_name) REFERENCES features(name) ON DELETE CASCADE;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feedback_survey_responses DROP CONSTRAINT IF EXISTS feedback_survey_responses_feature_name_fkey;
        ALTER TABLE feedback_survey_responses DROP CONSTRAINT IF EXISTS feedback_survey_responses_environment_id_fkey;
        ALTER TABLE feedback_survey_responses DROP COLUMN IF EXISTS environment_id;
        `,
        cb,
    );
};
