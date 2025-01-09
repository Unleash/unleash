exports.up = function(db, cb) {
    db.runSql(`
    CREATE TABLE IF NOT EXISTS unique_connections
    (
        id VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT now(),
        hll BYTEA NOT NULL,
        PRIMARY KEY (id)
    );
`, cb)
};

exports.down = function(db, cb) {
    db.runSql(`DROP TABLE unique_connections;`, cb);
};
