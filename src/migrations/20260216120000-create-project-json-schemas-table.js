exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS project_json_schemas (
            id TEXT NOT NULL PRIMARY KEY,
            project VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            schema JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(project, name)
        );
        CREATE INDEX idx_project_json_schemas_project ON project_json_schemas(project);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`DROP TABLE IF EXISTS project_json_schemas;`, cb);
};
