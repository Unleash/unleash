exports.up = function(db, cb) {
  db.runSql(`ALTER TABLE users ADD COLUMN created_by INTEGER`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`ALTER TABLE users DROP COLUMN created_by`, cb);
};