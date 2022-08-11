exports.up = function (db, cb) {
    db.runSql(
        `
            CREATE INDEX IF NOT EXISTS idx_feature_strategies_environment
                ON feature_strategies(environment);

            CREATE INDEX IF NOT EXISTS idx_feature_environments_environment
                ON feature_environments(environment); `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            DROP INDEX idx_feature_strategies_environment;
            DROP INDEX idx_feature_environments_environment;
`,
        cb,
    );
};
