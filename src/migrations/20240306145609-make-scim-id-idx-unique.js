exports.up = function(db, cb) {
  db.runSql(`DROP INDEX IF EXISTS users_scim_id_uniq_idx;
             CREATE UNIQUE INDEX users_scim_id_unique_idx ON users(scim_id) WHERE scim_id IS NOT NULL`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`DROP INDEX IF EXISTS users_scim_id_unique_idx;`, cb);
};
