
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
        CREATE INDEX IF NOT EXISTS stat_traffic_usage_day_idx ON stat_traffic_usage (day);
        CREATE INDEX IF NOT EXISTS stat_traffic_usage_traffic_group_idx ON stat_traffic_usage (traffic_group);
        CREATE INDEX IF NOT EXISTS stat_traffic_usage_status_code_series_idx ON stat_traffic_usage (status_code_series);
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP INDEX IF EXISTS stat_traffic_usage_day_idx;
        DROP INDEX IF EXISTS stat_traffic_usage_traffic_group_idx;
        DROP INDEX IF EXISTS stat_traffic_usage_status_code_series_idx;
        DROP TABLE IF EXISTS stat_traffic_usage;
        `,
        callback,
    );
};
