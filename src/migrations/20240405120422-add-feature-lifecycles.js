
export async function up(db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feature_lifecycles (
            feature VARCHAR(255) NOT NULL REFERENCES features(name) ON DELETE CASCADE,
            stage VARCHAR(255) NULL,
            created_at TIMESTAMP WITH TIME ZONE default now(),
            PRIMARY KEY (feature, stage)
        );`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('DROP TABLE IF EXISTS feature_lifecycles;', cb);
};
