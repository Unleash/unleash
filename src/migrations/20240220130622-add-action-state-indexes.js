exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE INDEX IF NOT EXISTS idx_action_states_action_id ON action_states(action_id);
        CREATE INDEX IF NOT EXISTS idx_action_states_observable_event_id ON action_states(observable_event_id);
        CREATE INDEX IF NOT EXISTS idx_action_states_action_observable ON action_states(action_id, observable_event_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_action_states_action_id;
        DROP INDEX IF EXISTS idx_action_states_observable_event_id;
        DROP INDEX IF EXISTS idx_action_states_action_observable;
        `,
        cb,
    );
};
