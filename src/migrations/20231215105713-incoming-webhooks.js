exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS incoming_webhooks
            (
                id SERIAL PRIMARY KEY NOT NULL,
                enabled BOOLEAN DEFAULT true NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                created_by_user_id INTEGER NOT NULL
            );
        CREATE INDEX incoming_webhooks_enabled_idx ON incoming_webhooks(enabled);

        CREATE TABLE IF NOT EXISTS incoming_webhook_tokens
            (
                id SERIAL PRIMARY KEY NOT NULL,
                secret TEXT NOT NULL,
                name TEXT NOT NULL,
                incoming_webhook_id INTEGER NOT NULL REFERENCES incoming_webhooks(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                created_by_user_id INTEGER NOT NULL
            );
        CREATE INDEX incoming_webhook_tokens_webhook_id_idx ON incoming_webhook_tokens(incoming_webhook_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS incoming_webhooks_enabled_idx;
        DROP INDEX IF EXISTS incoming_webhook_tokens_webhook_id_idx;
        DROP TABLE IF EXISTS incoming_webhook_tokens;
        DROP TABLE IF EXISTS incoming_webhooks;
        `,
        cb,
    );
};
