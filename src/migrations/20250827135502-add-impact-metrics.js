
exports.up = (db, callback) => {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS impact_metrics(
            id TEXT NOT NULL PRIMARY KEY,
            feature VARCHAR(255),
            config JSONB NOT NULL,
            FOREIGN KEY (feature) REFERENCES features(name) ON DELETE CASCADE
        );
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP TABLE IF EXISTS impact_metrics;
        `,
        callback,
    );
};
