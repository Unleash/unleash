export async function up (db, cb) {
  db.runSql(`
      ALTER TABLE users
          ADD COLUMN IF NOT EXISTS email_hash VARCHAR(32);

      UPDATE users
      SET email_hash = md5(email::text);
  `, cb);

};

export async function down (db, cb) {
  db.runSql(`
      ALTER TABLE users
          DROP COLUMN IF EXISTS email_hash;
  `, cb);
};

