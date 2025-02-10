exports.up = function(db, cb) {
  return db.runSql(`
    CREATE TABLE stat_edge_observability (
        instance_id TEXT NOT NULL,
        reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
        app_name TEXT,
        started TIMESTAMP WITH TIME ZONE NOT NULL,
        edge_version TEXT NOT NULL,
        region TEXT,
        cpu_usage NUMERIC DEFAULT 0.0,
        memory_usage INTEGER DEFAULT 0,
        connected_streaming_clients INTEGER NOT NULL DEFAULT 0,
        connected_via TEXT,
        PRIMARY KEY (instance_id, reported_at)
    );
    CREATE INDEX edge_observability_connected_via_idx ON stat_edge_observability(connected_via) WHERE connected_via IS NOT NULL;
    CREATE INDEX edge_observability_app_name_idx ON stat_edge_observability(app_name) WHERE app_name IS NOT NULL;
  `, cb);
};

exports.down = function(db, cb) {
  return db.runSql(`DROP TABLE IF EXISTS stat_edge_observability;`, cb);
};
