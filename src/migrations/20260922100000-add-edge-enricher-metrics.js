exports.up = (db, cb) => {
  db.runSql(`
    ALTER TABLE stat_edge_observability
      ADD COLUMN enricher_request_count BIGINT,
      ADD COLUMN enricher_average_latency_ms NUMERIC,
      ADD COLUMN enricher_p99_latency_ms NUMERIC,
      ADD COLUMN enricher_errors BIGINT,
      ADD COLUMN enricher_timeouts BIGINT;
  `, cb);
};

exports.down = (db, cb) => {
  db.runSql(`
    ALTER TABLE stat_edge_observability
      DROP COLUMN enricher_request_count,
      DROP COLUMN enricher_average_latency_ms,
      DROP COLUMN enricher_p99_latency_ms,
      DROP COLUMN enricher_errors,
      DROP COLUMN enricher_timeouts;
  `, cb);
};
