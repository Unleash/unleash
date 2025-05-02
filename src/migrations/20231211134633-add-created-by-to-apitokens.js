export async function up(db, cb) {
  db.runSql(`ALTER TABLE api_tokens ADD COLUMN created_by INTEGER`, cb);
};

export async function down(db, cb) {
  db.runSql(`ALTER TABLE api_tokens DROP COLUMN created_by`, cb);
};