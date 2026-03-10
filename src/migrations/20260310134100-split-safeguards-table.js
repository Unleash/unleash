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

        INSERT INTO release_plan_safeguards (id, impact_metric_id, trigger_condition, release_plan_id, environment, feature_name)
        SELECT
            s.id, s.impact_metric_id, s.trigger_condition,
            s.action->>'id',
            rpd.environment,
            rpd.feature_name
        FROM safeguards s
            JOIN release_plan_definitions rpd ON rpd.id = (s.action->>'id')
        WHERE s.action->>'type' = 'pauseReleasePlanProgressions';

        INSERT INTO feature_environment_safeguards (id, impact_metric_id, trigger_condition, environment, feature_name, project)
        SELECT
            s.id, s.impact_metric_id, s.trigger_condition,
            s.action->>'environment',
            s.action->>'featureName',
            s.action->>'project'
        FROM safeguards s
        WHERE s.action->>'type' = 'disableFeatureEnvironment';

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
