exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO release_plan_safeguards (id, impact_metric_id, trigger_condition, release_plan_id, environment, feature_name)
        SELECT
            s.id, s.impact_metric_id, s.trigger_condition,
            s.action->>'id',
            rpd.environment,
            rpd.feature_name
        FROM safeguards s
            JOIN release_plan_definitions rpd ON rpd.id = (s.action->>'id')
        WHERE s.action->>'type' = 'pauseReleasePlanProgressions'
            AND s.id IS NOT NULL
            AND s.impact_metric_id IS NOT NULL
            AND s.trigger_condition IS NOT NULL
            AND s.action->>'id' IS NOT NULL
            AND rpd.environment IS NOT NULL
            AND rpd.feature_name IS NOT NULL
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO feature_environment_safeguards (id, impact_metric_id, trigger_condition, environment, feature_name, project)
        SELECT
            s.id, s.impact_metric_id, s.trigger_condition,
            s.action->>'environment',
            s.action->>'featureName',
            s.action->>'project'
        FROM safeguards s
        WHERE s.action->>'type' = 'disableFeatureEnvironment'
            AND s.id IS NOT NULL
            AND s.impact_metric_id IS NOT NULL
            AND s.trigger_condition IS NOT NULL
            AND s.action->>'environment' IS NOT NULL
            AND s.action->>'featureName' IS NOT NULL
            AND s.action->>'project' IS NOT NULL
        ON CONFLICT (id) DO NOTHING;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
