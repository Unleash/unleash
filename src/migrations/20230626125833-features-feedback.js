exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feature_feedback (
            id SERIAL PRIMARY KEY NOT NULL,
            feature_name VARCHAR (255) NOT NULL REFERENCES features(name) ON DELETE CASCADE,
            context_hash VARCHAR (255),
            payload text,
            metadata JSON DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW()
        );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS feature_feedback;
        `,
        cb,
    );
};
