export async function up(db, cb) {
  db.runSql(`ALTER TABLE users ADD COLUMN created_by INTEGER`, cb);
};

export async function down(db, cb) {
  db.runSql(`ALTER TABLE users DROP COLUMN created_by`, cb);
};