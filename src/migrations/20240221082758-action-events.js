exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS action_set_events
        (
            id SERIAL PRIMARY KEY NOT NULL,
            action_set_id INTEGER NOT NULL,
            observable_event_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            state TEXT NOT NULL,
            observable_event JSONB NOT NULL,
            action_set JSONB NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_action_set_events_observable_event_id ON action_set_events(observable_event_id);
        CREATE INDEX IF NOT EXISTS idx_action_set_events_action_set_id_state ON action_set_events(action_set_id, state);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_action_set_events_observable_event_id;
        DROP INDEX IF EXISTS idx_action_set_events_action_set_id_state;
        DROP TABLE IF EXISTS action_set_events;
        `,
        cb,
    );
};
