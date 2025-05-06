exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS action_sets
        (
            id SERIAL PRIMARY KEY NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            created_by_user_id INTEGER,
            name varchar(255),
            project VARCHAR(255) NOT NULL,
            actor_id INTEGER,
            source varchar(255),
            source_id INTEGER,
            payload JSONB DEFAULT '{}'::jsonb NOT NULL,
            FOREIGN KEY (project) references projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS actions
        (
            id SERIAL PRIMARY KEY NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            created_by_user_id INTEGER,
            action_set_id INTEGER references action_sets (id) ON DELETE CASCADE,
            sort_order INTEGER,
            action varchar(255) NOT NULL,
            execution_params JSONB DEFAULT '{}'::jsonb NOT NULL
        );

        CREATE INDEX idx_action_sets_project ON action_sets (project);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_action_sets_project;
        DROP TABLE IF EXISTS actions;
        DROP TABLE IF EXISTS action_sets;
        `,
        cb,
    );
};
