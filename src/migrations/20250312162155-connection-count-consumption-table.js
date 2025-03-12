
exports.up = (db, callback) => {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS request_count_consumption(
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
        DROP TABLE IF EXISTS request_count_consumption;
        `,
        callback,
    );
};
