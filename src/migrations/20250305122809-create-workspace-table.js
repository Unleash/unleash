exports.up = function (db, cb) {
    db.runSql(
        `
        -- Create workspaces table with auto-incrementing id if it doesn't exist
        CREATE TABLE IF NOT EXISTS workspaces (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
        );

        -- Create the default workspace only if it doesn't exist
        INSERT INTO workspaces (name, description) 
        VALUES ('Unleash', 'Default Unleash workspace')
        ON CONFLICT (name) DO NOTHING;

        -- Add workspace_id to tables if the column doesn't exist
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='workspace_id') THEN
                ALTER TABLE projects ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='segments' AND column_name='workspace_id') THEN
                ALTER TABLE segments ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='strategies' AND column_name='workspace_id') THEN
                ALTER TABLE strategies ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='api_tokens' AND column_name='workspace_id') THEN
                ALTER TABLE api_tokens ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='environments' AND column_name='workspace_id') THEN
                ALTER TABLE environments ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='features' AND column_name='workspace_id') THEN
                ALTER TABLE features ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='context_fields' AND column_name='workspace_id') THEN
                ALTER TABLE context_fields ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
        END $$;

        -- Migrate existing data to workspace 1 if not already set
        UPDATE projects SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE segments SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE strategies SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE api_tokens SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE environments SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE features SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE context_fields SET workspace_id = 1 WHERE workspace_id IS NULL;

        -- Make columns NOT NULL if they aren't already
        DO $$
        BEGIN
            ALTER TABLE projects ALTER COLUMN workspace_id SET NOT NULL;
            ALTER TABLE segments ALTER COLUMN workspace_id SET NOT NULL;
            ALTER TABLE strategies ALTER COLUMN workspace_id SET NOT NULL;
            ALTER TABLE api_tokens ALTER COLUMN workspace_id SET NOT NULL;
            ALTER TABLE environments ALTER COLUMN workspace_id SET NOT NULL;
            ALTER TABLE features ALTER COLUMN workspace_id SET NOT NULL;
            ALTER TABLE context_fields ALTER COLUMN workspace_id SET NOT NULL;
        EXCEPTION
            WHEN others THEN null;
        END $$;

        -- Create indexes if they don't exist
        CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_segments_workspace_id ON segments(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_strategies_workspace_id ON strategies(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_api_tokens_workspace_id ON api_tokens(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_environments_workspace_id ON environments(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_features_workspace_id ON features(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_context_fields_workspace_id ON context_fields(workspace_id);
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        -- Drop indexes if they exist
        DROP INDEX IF EXISTS idx_projects_workspace_id;
        DROP INDEX IF EXISTS idx_segments_workspace_id;
        DROP INDEX IF EXISTS idx_strategies_workspace_id;
        DROP INDEX IF EXISTS idx_api_tokens_workspace_id;
        DROP INDEX IF EXISTS idx_environments_workspace_id;
        DROP INDEX IF EXISTS idx_features_workspace_id;
        DROP INDEX IF EXISTS idx_context_fields_workspace_id;

        -- Drop columns if they exist
        DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='workspace_id') THEN
                ALTER TABLE projects DROP COLUMN workspace_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='segments' AND column_name='workspace_id') THEN
                ALTER TABLE segments DROP COLUMN workspace_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='strategies' AND column_name='workspace_id') THEN
                ALTER TABLE strategies DROP COLUMN workspace_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='api_tokens' AND column_name='workspace_id') THEN
                ALTER TABLE api_tokens DROP COLUMN workspace_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='environments' AND column_name='workspace_id') THEN
                ALTER TABLE environments DROP COLUMN workspace_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='features' AND column_name='workspace_id') THEN
                ALTER TABLE features DROP COLUMN workspace_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='context_fields' AND column_name='workspace_id') THEN
                ALTER TABLE context_fields DROP COLUMN workspace_id;
            END IF;
        END $$;

        -- Drop workspaces table if it exists
        DROP TABLE IF EXISTS workspaces;
        `,
        cb
    );
};