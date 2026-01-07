exports.up = function(db, cb) {
  db.runSql(`
    ALTER TABLE users DROP COLUMN email_hash;
    ALTER TABLE users ADD COLUMN email_hash TEXT;
    UPDATE users SET email_hash = encode(sha256(email::bytea), 'hex') WHERE email IS NOT NULL;
    CREATE INDEX users_email_hash_idx ON users(email_hash);
`, cb);
};

exports.down = function(db, cb) {
    cb();
};
