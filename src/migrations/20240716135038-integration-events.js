exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS integration_events
        (
            id BIGSERIAL PRIMARY KEY NOT NULL,
            integration_id INTEGER NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            state TEXT NOT NULL,
            state_details TEXT NOT NULL,
            event JSONB NOT NULL,
            details JSONB NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_integration_events_integration_id ON integration_events(integration_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_integration_events_integration_id;
        DROP TABLE IF EXISTS integration_events;
        `,
        cb,
    );
};
