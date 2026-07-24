exports.up = function(db, cb) {
  db.runSql(`ALTER TABLE api_tokens_v2 ADD COLUMN user_created BOOLEAN NOT NULL;`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`ALTER TABLE api_tokens_v2 DROP COLUMN user_created`, cb);
};
