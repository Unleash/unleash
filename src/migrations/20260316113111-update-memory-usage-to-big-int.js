exports.up = function(db, cb) {
  db.runSql(`ALTER TABLE stat_edge_observability ALTER COLUMN memory_usage TYPE BIGINT`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`ALTER TABLE stat_edge_observability ALTER COLUMN memory_usage TYPE INTEGER`, cb);
};
