exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS ai_agent_events (
            id SERIAL PRIMARY KEY,
            agent_id INTEGER NOT NULL REFERENCES ai_agents (id) ON DELETE CASCADE,
            title TEXT,
            description TEXT NOT NULL,
            "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc')
        );

        CREATE INDEX IF NOT EXISTS idx_ai_agent_events_agent_id_timestamp
            ON ai_agent_events (agent_id, "timestamp" DESC);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS ai_agent_events;
        `,
        cb,
    );
};
