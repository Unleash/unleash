exports.up = function (db, cb) {
    db.runSql(
        `
        -- Create workspaces table with auto-incrementing id
        CREATE TABLE workspaces (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
        );

        -- Create the default "unleash" workspace (will get id=1)
        INSERT INTO workspaces (name, description) 
        VALUES ('Unleash', 'Default Unleash workspace');

        -- Add workspace_id to all relevant tables (initially nullable for migration)
        ALTER TABLE projects 
        ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;

        ALTER TABLE segments 
        ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;

        ALTER TABLE strategies 
        ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;

        ALTER TABLE api_tokens 
        ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;

        ALTER TABLE environments 
        ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;

        ALTER TABLE features 
        ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;

        -- Migrate all existing data to the "unleash" workspace (id=1)
        UPDATE projects SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE segments SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE strategies SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE api_tokens SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE environments SET workspace_id = 1 WHERE workspace_id IS NULL;
        UPDATE features SET workspace_id = 1 WHERE workspace_id IS NULL;

        -- Make workspace_id NOT NULL after migration
        ALTER TABLE projects ALTER COLUMN workspace_id SET NOT NULL;
        ALTER TABLE segments ALTER COLUMN workspace_id SET NOT NULL;
        ALTER TABLE strategies ALTER COLUMN workspace_id SET NOT NULL;
        ALTER TABLE api_tokens ALTER COLUMN workspace_id SET NOT NULL;
        ALTER TABLE environments ALTER COLUMN workspace_id SET NOT NULL;
        ALTER TABLE features ALTER COLUMN workspace_id SET NOT NULL;

        -- Add indexes for performance
        CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
        CREATE INDEX idx_segments_workspace_id ON segments(workspace_id);
        CREATE INDEX idx_strategies_workspace_id ON strategies(workspace_id);
        CREATE INDEX idx_api_tokens_workspace_id ON api_tokens(workspace_id);
        CREATE INDEX idx_environments_workspace_id ON environments(workspace_id);
        CREATE INDEX idx_features_workspace_id ON features(workspace_id);
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        -- Drop indexes
        DROP INDEX idx_projects_workspace_id;
        DROP INDEX idx_segments_workspace_id;
        DROP INDEX idx_strategies_workspace_id;
        DROP INDEX idx_api_tokens_workspace_id;
        DROP INDEX idx_environments_workspace_id;
        DROP INDEX idx_features_workspace_id;

        -- Drop workspace_id columns
        ALTER TABLE projects DROP COLUMN workspace_id;
        ALTER TABLE segments DROP COLUMN workspace_id;
        ALTER TABLE strategies DROP COLUMN workspace_id;
        ALTER TABLE api_tokens DROP COLUMN workspace_id;
        ALTER TABLE environments DROP COLUMN workspace_id;
        ALTER TABLE features DROP COLUMN workspace_id;

        -- Drop workspaces table
        DROP TABLE workspaces;
        `,
        cb
    );
};