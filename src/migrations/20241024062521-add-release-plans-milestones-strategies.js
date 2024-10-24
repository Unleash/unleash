exports.up = function(db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS release_plan_definitions
        (
            id TEXT PRIMARY KEY NOT NULL,
            discriminator TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            feature_name TEXT,
			environment TEXT,
            created_by_user_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
            CONSTRAINT release_plan_definitions_discriminator_values
                CHECK (discriminator IN ('plan', 'template')),
            CONSTRAINT feature_environments_fkey FOREIGN KEY (environment, feature_name)
                REFERENCES feature_environments(environment, feature_name)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS milestones
        (
            id SERIAL PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            sort_order INTEGER NOT NULL,
            release_plan_definition_id TEXT NOT NULL REFERENCES release_plan_definitions(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_milestones_release_plan_definition_id ON milestones (release_plan_definition_id);

        ALTER TABLE IF EXISTS release_plan_definitions
            ADD COLUMN IF NOT EXISTS active_milestone_id INT REFERENCES milestones(id);
        
        CREATE TABLE IF NOT EXISTS milestone_strategies
        (
            id SERIAL PRIMARY KEY NOT NULL,
            milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
            sort_order INTEGER NOT NULL,
            title TEXT NOT NULL,
            strategy_name TEXT NOT NULL REFERENCES strategies(name),
            parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
            constraints JSONB
        );
        CREATE INDEX IF NOT EXISTS idx_milestone_strategies_strategy_name ON milestone_strategies (strategy_name);
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_milestone_strategies_strategy_name;
        DROP INDEX IF EXISTS idx_milestones_release_plan_definition_id;
        ALTER TABLE IF EXISTS release_plan_definitions DROP COLUMN IF EXISTS active_milestone_id;
        DROP TABLE IF EXISTS milestone_strategies;
        DROP TABLE IF EXISTS milestones;
        DROP TABLE IF EXISTS release_plan_definitions;
        `,
        cb,
    );
};