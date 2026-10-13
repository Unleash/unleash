exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feedback_survey_responses (
            id TEXT PRIMARY KEY,
            feature_name TEXT NOT NULL,
            survey_version INTEGER NOT NULL,
            respondent_id TEXT,
            answers JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS feedback_survey_responses_feature_name_idx ON feedback_survey_responses (feature_name);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS feedback_survey_responses;
        `,
        cb,
    );
};
