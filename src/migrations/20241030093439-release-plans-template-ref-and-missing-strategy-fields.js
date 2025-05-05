exports.up = function(db, cb) {
    db.runSql(`
        ALTER TABLE release_plan_definitions ADD COLUMN release_plan_template_id TEXT REFERENCES release_plan_definitions(id) ON DELETE CASCADE;
        CREATE INDEX idx_release_plan_template_definition_id ON release_plan_definitions (release_plan_template_id) WHERE release_plan_template_id IS NOT NULL;

        ALTER TABLE feature_strategies ADD COLUMN milestone_id TEXT REFERENCES milestones(id) ON DELETE CASCADE;
        CREATE INDEX idx_feature_strategies_milestone_id ON feature_strategies (milestone_id) WHERE milestone_id IS NOT NULL;

        CREATE TABLE milestone_strategy_segments (
            segment_id INT NOT NULL references segments(id) ON DELETE CASCADE,
            milestone_strategy_id TEXT NOT NULL references milestone_strategies(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
            PRIMARY KEY (segment_id, milestone_strategy_id)
        );

        ALTER TABLE milestone_strategies ADD COLUMN variants JSONB NOT NULL DEFAULT '[]'::JSONB;
    `, cb)
};

exports.down = function(db, cb) {
    db.runSql(`
        ALTER TABLE release_plan_definitions DROP COLUMN release_plan_template_id;
        ALTER TABLE feature_strategies DROP COLUMN milestone_id;
        DROP TABLE milestone_strategy_segments;
        ALTER TABLE milestone_strategies DROP COLUMN variants;
    `, cb);
};
