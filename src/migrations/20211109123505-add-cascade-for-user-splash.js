exports.up = function (db, cb) {
  db.runSql(
      `
  ALTER TABLE user_splash DROP CONSTRAINT user_splash_user_id_fkey;
  ALTER TABLE user_splash 
      ADD CONSTRAINT user_splash_user_id_fkey
      FOREIGN KEY (user_id) 
      REFERENCES users(id) ON DELETE CASCADE;
`,
      cb,
  );
};

exports.down = function (db, cb) {
  db.runSql('', cb);
};
