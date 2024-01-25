exports.up = function (db, cb) {
  db.runSql(
      `
      UPDATE events SET created_by_user_id = null
      WHERE
          created_by_user_id = -1337 AND
          created_by = 'unleash_system_user' OR
          created_by = 'systemuser@getunleash.io';
      `,
      cb,
  );
};

exports.down = function (db, cb) {
    cb();
};
