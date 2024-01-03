exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS observable_events
            (
                id SERIAL PRIMARY KEY NOT NULL,
                payload JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                source TEXT NOT NULL,
                source_id INTEGER NOT NULL,
                created_by_incoming_webhook_token_id INTEGER,
                announced BOOLEAN DEFAULT false NOT NULL
            );
        CREATE INDEX observable_events_source_and_source_id_idx ON observable_events(source, source_id);
        CREATE INDEX observable_events_created_by_incoming_webhook_token_id_idx ON observable_events(created_by_incoming_webhook_token_id);
        CREATE INDEX observable_events_unannounced_idx ON observable_events(announced) WHERE announced = false;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS observable_events_source_and_source_id_idx;
        DROP INDEX IF EXISTS observable_events_created_by_incoming_webhook_token_id_idx;
        DROP INDEX IF EXISTS observable_events_unannounced_idx;
        DROP TABLE IF EXISTS observable_events;
        `,
        cb,
    );
};
