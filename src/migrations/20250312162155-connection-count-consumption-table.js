
exports.up = (db, callback) => {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS frontend_consumption_count(
            day DATE NOT NULL,
            metered_group TEXT NOT NULL,
            requests BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY(day, metered_group)
            );
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP TABLE IF EXISTS frontend_consumption_count;
        `,
        callback,
    );
};
