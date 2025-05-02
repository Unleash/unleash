export async function up(db, cb) {
  db.runSql(`ALTER TABLE role_user ADD COLUMN created_by INTEGER`, cb);
};

export async function down(db, cb) {
  db.runSql(`ALTER TABLE role_user DROP COLUMN created_by`, cb);
};