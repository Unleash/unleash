exports.up = function(db, cb) {
    db.runSql(`ALTER TABLE edge_api_tokens DROP CONSTRAINT edge_api_tokens_token_value_fkey;
               ALTER TABLE edge_api_tokens ADD CONSTRAINT edge_api_tokens_token_value_fkey FOREIGN KEY (token_value) REFERENCES api_tokens(secret) ON DELETE NO ACTION;
               CREATE INDEX IF NOT EXISTS edge_api_tokens_token_value_idx ON edge_api_tokens(token_value);`, cb);
}

exports.down = function(db, cb) {
    db.runSql(`ALTER TABLE edge_api_tokens DROP CONSTRAINT edge_api_tokens_token_value_fkey;
               ALTER TABLE edge_api_tokens
                   ADD CONSTRAINT edge_api_tokens_token_value_fkey
                       FOREIGN KEY (token_value)
                           REFERENCES api_tokens(secret)
                           ON DELETE CASCADE;`, cb);
}
