exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feature_payload_schemas (
            feature_name VARCHAR(255) PRIMARY KEY REFERENCES features(name) ON DELETE CASCADE,
            schema JSON NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS feature_payload_schemas;
        `,
        cb,
    );
};
