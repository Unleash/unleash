exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feature_environment_safeguards (
            id TEXT PRIMARY KEY,
            impact_metric_id TEXT NOT NULL REFERENCES impact_metrics(id) ON DELETE CASCADE,
            trigger_condition JSONB NOT NULL,
            environment TEXT NOT NULL,
            feature_name TEXT NOT NULL,
            project TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (environment, feature_name) REFERENCES feature_environments(environment, feature_name) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS release_plan_safeguards (
            id TEXT PRIMARY KEY,
            impact_metric_id TEXT NOT NULL REFERENCES impact_metrics(id) ON DELETE CASCADE,
            trigger_condition JSONB NOT NULL,
            release_plan_id TEXT NOT NULL REFERENCES release_plan_definitions(id) ON DELETE CASCADE,
            environment TEXT NOT NULL,
            feature_name TEXT NOT NULL,
            FOREIGN KEY (environment, feature_name) REFERENCES feature_environments(environment, feature_name) ON DELETE CASCADE
        );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS release_plan_safeguards;
        DROP TABLE IF EXISTS feature_environment_safeguards;
        `,
        cb,
    );
};
