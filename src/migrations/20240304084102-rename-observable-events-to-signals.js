exports.up = function (db, cb) {
    db.runSql(
        `
        -- Drop existing indexes that will be recreated with new names
        DROP INDEX IF EXISTS idx_action_set_events_observable_event_id;
        DROP INDEX IF EXISTS observable_events_source_and_source_id_idx;
        DROP INDEX IF EXISTS observable_events_created_by_incoming_webhook_token_id_idx;
        DROP INDEX IF EXISTS observable_events_unannounced_idx;
        DROP INDEX IF EXISTS incoming_webhooks_enabled_idx;
        DROP INDEX IF EXISTS incoming_webhook_tokens_webhook_id_idx;

        -- Rename columns and tables to the new names
        ALTER TABLE action_set_events RENAME COLUMN observable_event_id TO signal_id;
        ALTER TABLE action_set_events RENAME COLUMN observable_event TO signal;

        ALTER TABLE observable_events RENAME TO signals;
        ALTER TABLE signals RENAME COLUMN created_by_incoming_webhook_token_id TO created_by_source_token_id;

        ALTER TABLE incoming_webhooks RENAME TO signal_endpoints;
        ALTER TABLE incoming_webhook_tokens RENAME TO signal_endpoint_tokens;
        ALTER TABLE signal_endpoint_tokens RENAME COLUMN incoming_webhook_id TO signal_endpoint_id;

        -- Create new indexes with the new names
        CREATE INDEX IF NOT EXISTS idx_action_set_events_signal_id ON action_set_events(signal_id);

        CREATE INDEX IF NOT EXISTS idx_signals_source_and_source_id ON signals(source, source_id);
        CREATE INDEX IF NOT EXISTS idx_signals_created_by_source_token_id ON signals(created_by_source_token_id);
        CREATE INDEX IF NOT EXISTS idx_signals_unannounced ON signals(announced) WHERE announced = false;

        CREATE INDEX IF NOT EXISTS idx_signal_endpoints_enabled ON signal_endpoints(enabled);
        CREATE INDEX IF NOT EXISTS idx_signal_endpoint_tokens_signal_endpoint_id ON signal_endpoint_tokens(signal_endpoint_id);

        -- Add new description column to action_sets
        ALTER TABLE action_sets ADD COLUMN IF NOT EXISTS description TEXT;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        -- Remove the indexes added in the up migration
        DROP INDEX IF EXISTS idx_action_set_events_signal_id;
        DROP INDEX IF EXISTS idx_signals_source_and_source_id;
        DROP INDEX IF EXISTS idx_signals_created_by_source_token_id;
        DROP INDEX IF EXISTS idx_signals_unannounced;
        DROP INDEX IF EXISTS idx_signal_endpoints_enabled;
        DROP INDEX IF EXISTS idx_signal_endpoint_tokens_signal_endpoint_id;

        -- Rename columns and tables back to their original names
        ALTER TABLE action_set_events RENAME COLUMN signal_id TO observable_event_id;
        ALTER TABLE action_set_events RENAME COLUMN signal TO observable_event;

        ALTER TABLE signals RENAME COLUMN created_by_source_token_id TO created_by_incoming_webhook_token_id;
        ALTER TABLE signals RENAME TO observable_events;

        ALTER TABLE signal_endpoints RENAME TO incoming_webhooks;
        ALTER TABLE signal_endpoint_tokens RENAME COLUMN signal_endpoint_id TO incoming_webhook_id;
        ALTER TABLE signal_endpoint_tokens RENAME TO incoming_webhook_tokens;

        -- Recreate the dropped indexes from the up migration
        CREATE INDEX IF NOT EXISTS idx_action_set_events_observable_event_id ON action_set_events(observable_event_id);

        CREATE INDEX IF NOT EXISTS observable_events_source_and_source_id_idx ON observable_events(source, source_id);
        CREATE INDEX IF NOT EXISTS observable_events_created_by_incoming_webhook_token_id_idx ON observable_events(created_by_incoming_webhook_token_id);
        CREATE INDEX IF NOT EXISTS observable_events_unannounced_idx ON observable_events(announced) WHERE announced = false;

        CREATE INDEX IF NOT EXISTS incoming_webhooks_enabled_idx ON incoming_webhooks(enabled);
        CREATE INDEX IF NOT EXISTS incoming_webhook_tokens_webhook_id_idx ON incoming_webhook_tokens(incoming_webhook_id);

        -- Remove the column added in the up migration
        ALTER TABLE action_sets DROP COLUMN IF EXISTS description;
        `,
        cb,
    );
};
