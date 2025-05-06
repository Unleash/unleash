exports.up = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_action_states_action_id;
        DROP INDEX IF EXISTS idx_action_states_observable_event_id;
        DROP INDEX IF EXISTS idx_action_states_action_observable;

        DROP TABLE IF EXISTS action_states;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS action_states
        (
            id SERIAL PRIMARY KEY NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            state VARCHAR(255) NOT NULL,
            details VARCHAR(255),
            action_id INTEGER NOT NULL,
            observable_event_id INTEGER NOT NULL,
            FOREIGN KEY (observable_event_id) references observable_events(id),
            FOREIGN KEY (action_id) references actions(id)
        );

        CREATE INDEX IF NOT EXISTS idx_action_states_action_id ON action_states(action_id);
        CREATE INDEX IF NOT EXISTS idx_action_states_observable_event_id ON action_states(observable_event_id);
        CREATE INDEX IF NOT EXISTS idx_action_states_action_observable ON action_states(action_id, observable_event_id);
        `,
        cb,
    );
};
