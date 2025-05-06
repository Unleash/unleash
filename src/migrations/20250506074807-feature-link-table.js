
exports.up = (db, callback) => {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feature_link(
            id TEXT NOT NULL PRIMARY KEY,
            feature_name VARCHAR(255) NOT NULL,
            url TEXT NOT NULL,
            title TEXT,
            FOREIGN KEY (feature_name) REFERENCES features(name) ON DELETE CASCADE
            );
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP TABLE IF EXISTS feature_link;
        `,
        callback,
    );
};
