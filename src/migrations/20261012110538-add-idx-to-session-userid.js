exports.up = function(db, cb) {
  db.runSql(`CREATE INDEX IF NOT EXISTS unleash_session_user_id_idx
ON unleash_session (((sess -> 'user' ->> 'id')::int));`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`DROP INDEX IF EXISTS unleash_session_user_id_idx;`, cb);
};
