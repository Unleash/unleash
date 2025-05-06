exports.up = function(db, cb) {
  db.runSql(`
    ALTER TABLE users ADD COLUMN scim_id TEXT;
    CREATE INDEX IF NOT EXISTS users_scim_id_uniq_idx ON users (scim_id) WHERE scim_id IS NOT NULL;
  `, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
    DROP INDEX IF EXISTS users_scim_id_uniq_idx;
    ALTER TABLE users DROP COLUMN scim_id;
  `, cb);
};
