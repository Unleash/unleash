exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS ai_agents (
            id SERIAL PRIMARY KEY,
            external_id TEXT NOT NULL UNIQUE,
            display_name TEXT,
            type TEXT,
            last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc')
        );

        CREATE INDEX IF NOT EXISTS idx_ai_agents_last_seen_at
            ON ai_agents (last_seen_at);

        CREATE INDEX IF NOT EXISTS idx_ai_agents_type
            ON ai_agents (type);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS ai_agents;
        `,
        cb,
    );
};
