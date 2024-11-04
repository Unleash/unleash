exports.up = function(db, cb) {
    db.runSql(`
    CREATE TABLE IF NOT EXISTS emails_sent
    (
        id VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        PRIMARY KEY (id, type)
    );
`, cb)
};

exports.down = function(db, cb) {
    db.runSql(`DROP TABLE emails_sent;`, cb);
};
