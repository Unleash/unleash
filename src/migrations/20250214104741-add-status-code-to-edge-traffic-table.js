exports.up = (db, cb) => {
    db.runSql(`
    ALTER TABLE stat_edge_traffic_usage ADD COLUMN status_code INT NOT NULL DEFAULT 200;
    CREATE INDEX stat_edge_traffic_usage_traffic_group_status_code_idx ON stat_edge_traffic_usage(status_code, traffic_group);
    ALTER TABLE stat_edge_traffic_usage
        DROP CONSTRAINT stat_edge_traffic_usage_pkey,
        ADD PRIMARY KEY (instance_id, traffic_group, day, status_code);
    `, cb);
};

exports.down = (db, cb) => {
    db.runSql(`
        ALTER TABLE stat_edge_traffic_usage DROP CONSTRAINT stat_edge_traffic_usage_pkey;
        DROP INDEX IF EXISTS stat_edge_traffic_usage_traffic_group_status_code_idx;
        ALTER TABLE stat_edge_traffic_usage DROP COLUMN status_code;
        ALTER TABLE stat_edge_traffic_usage ADD PRIMARY KEY (instance_id, traffic_group, day);
    `, cb);
};
