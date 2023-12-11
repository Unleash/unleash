exports.up = function(db, cb) {
  db.runSql(`ALTER TABLE role_permission ADD COLUMN created_by INTEGER`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`ALTER TABLE role_permission DROP COLUMN created_by`, cb);
};