export async function up(db, cb) {
  db.runSql(
      `
      UPDATE events SET created_by_user_id = null
      WHERE
          created_by_user_id = -1337 AND
          created_by NOT IN (
              'unknown',
              'migration',
              'init-api-tokens',
              'unleash_system_user',
              'systemuser@getunleash.io');
      `,
      cb,
  );
};

export async function down(db, cb) {
    cb();
};
