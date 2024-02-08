
exports.up = (db, callback) => {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS stat_traffic_usage(
            day DATE NOT NULL,
            traffic_group TEXT NOT NULL,
            status_code_series INT NOT NULL,
            count BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY(day, traffic_group, status_code_series)
            );
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP TABLE IF EXISTS stat_traffic_usage;
        `,
        callback,
    );
};
