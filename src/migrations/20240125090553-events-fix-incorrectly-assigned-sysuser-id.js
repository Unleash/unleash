exports.up = function (db, cb) {
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

exports.down = function (db, cb) {
    cb();
};
