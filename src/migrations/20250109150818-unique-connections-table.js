export async function up(db, cb) {
    db.runSql(`
    CREATE TABLE IF NOT EXISTS unique_connections
    (
        id VARCHAR(255) PRIMARY KEY NOT NULL,
        updated_at TIMESTAMP DEFAULT now(),
        hll BYTEA NOT NULL
    );
`, cb)
};

export async function down(db, cb) {
    db.runSql(`DROP TABLE unique_connections;`, cb);
};
