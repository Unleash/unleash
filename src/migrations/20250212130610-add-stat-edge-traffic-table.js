exports.up = (db, cb) => {
  db.runSql(`CREATE TABLE stat_edge_traffic_usage(
    instance_id TEXT NOT NULL,
    day DATE NOT NULL,
    traffic_group TEXT NOT NULL,
    count BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (instance_id, day, traffic_group)
  );
    CREATE INDEX stat_edge_traffic_usage_traffic_group_idx ON stat_edge_traffic_usage(traffic_group);
    CREATE INDEX stat_edge_traffic_usage_day_idx ON stat_edge_traffic_usage(day);
`, cb);
};

exports.down = (db, cb) => {
  db.runSql(`DROP TABLE stat_edge_traffic_usage;`, cb);
};
