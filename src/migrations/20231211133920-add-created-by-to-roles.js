export async function up(db, cb) {
  db.runSql(`ALTER TABLE roles ADD COLUMN created_by INTEGER`, cb);
};

export async function down(db, cb) {
  db.runSql(`ALTER TABLE roles DROP COLUMN created_by`, cb);
};