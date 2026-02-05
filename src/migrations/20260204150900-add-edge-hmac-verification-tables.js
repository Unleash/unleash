exports.up = function(db, cb) {
    db.runSql(`
        CREATE TABLE edge_hmac_clients(
            id TEXT PRIMARY KEY NOT NULL,
            secret_enc BYTEA NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc')
        );
        CREATE TABLE edge_hmac_nonces(
            client_id TEXT REFERENCES edge_hmac_clients(id) ON DELETE CASCADE,
            nonce TEXT,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            PRIMARY KEY (client_id, nonce)
        );
        CREATE INDEX edge_hmac_nonces_nonce_idx ON edge_hmac_nonces(nonce);
        CREATE INDEX edge_hmac_nonces_client_id_idx ON edge_hmac_nonces(client_id);
        CREATE TABLE edge_api_tokens(
            id TEXT PRIMARY KEY NOT NULL,
            client_id TEXT NOT NULL REFERENCES edge_hmac_clients(id) ON DELETE CASCADE,
            environment TEXT NOT NULL,
            projects JSONB NOT NULL,
            scope_hash TEXT NOT NULL,
            token_value TEXT NOT NULL REFERENCES api_tokens(secret) ON UPDATE CASCADE ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
            revoked_at TIMESTAMP WITH TIME ZONE
        );
        CREATE UNIQUE INDEX edge_api_token_scope_uniq_idx ON edge_api_tokens(client_id, scope_hash) WHERE revoked_at IS NULL;
    `, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
    DROP TABLE edge_api_tokens;
    DROP TABLE edge_hmac_nonces;
    DROP TABLE edge_hmac_clients;

  `, cb);
};

