exports.up = function(db, cb) {
  db.runSql(`ALTER TABLE stat_edge_observability ADD COLUMN api_key_revision_ids JSONB;`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`ALTER TABLE stat_edge_observability DROP COLUMN api_key_revision_ids;`, cb);
};
