exports.up = function(db, cb) {
  db.runSql(`
    CREATE TABLE used_passwords(user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                                password_hash TEXT NOT NULL,
                                used_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT time zone 'utc'),
                                PRIMARY KEY (user_id, password_hash)
    );
    INSERT INTO used_passwords(user_id, password_hash) SELECT id, password_hash FROM users WHERE password_hash IS NOT NULL;
    CREATE INDEX used_passwords_pw_hash_idx ON used_passwords(password_hash);
`, cb)
};

exports.down = function(db, cb) {
  db.runSql(`DROP TABLE used_passwords;`, cb);
};
