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
        `,
        cb,
    );
};
