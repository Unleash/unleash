exports.up = function (db, cb) {
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
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_state_to_observable_event_id;
        DROP TABLE IF EXISTS action_states;
        `,
        cb,
    );
};
