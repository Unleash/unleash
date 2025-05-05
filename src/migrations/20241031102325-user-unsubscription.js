exports.up = function(db, cb) {
    db.runSql(`
    CREATE TABLE IF NOT EXISTS user_unsubscription
    (
        user_id INTEGER NOT NULL references users (id),
        subscription VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        PRIMARY KEY (user_id, subscription)
    );
`, cb);
};

exports.down = function(db, cb) {
    db.runSql(`DROP TABLE IF EXISTS user_unsubscription;`, cb);
};
