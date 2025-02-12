exports.up = (db, cb) => {
  db.runSql(`
    CREATE TABLE stat_edge_observability (
        instance_id TEXT NOT NULL PRIMARY KEY,
        reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
        app_name TEXT,
        started TIMESTAMP WITH TIME ZONE NOT NULL,
        edge_version TEXT NOT NULL,
        region TEXT,
        cpu_usage NUMERIC DEFAULT 0.0,
        memory_usage INTEGER DEFAULT 0,
        connected_streaming_clients INTEGER NOT NULL DEFAULT 0,
        connected_via TEXT,
        client_features_average_latency_ms NUMERIC DEFAULT 0.0,
        client_features_p99_latency_ms NUMERIC DEFAULT 0.0,
        frontend_api_average_latency_ms NUMERIC DEFAULT 0.0,
        frontend_api_p99_latency_ms NUMERIC DEFAULT 0.0
    );
    CREATE INDEX edge_observability_connected_via_idx ON stat_edge_observability(connected_via) WHERE connected_via IS NOT NULL;
    CREATE INDEX edge_observability_app_name_idx ON stat_edge_observability(app_name) WHERE app_name IS NOT NULL;
  `, cb);
};

exports.down = (db, cb) => {
  db.runSql(`DROP TABLE IF EXISTS stat_edge_observability;`, cb);
};
