exports.up = function(db, cb) {
    db.runSql(`
        ALTER TABLE environments ADD COLUMN enabled_in_oss BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE projects ADD COLUMN enabled_in_oss BOOLEAN NOT NULL DEFAULT false;
        UPDATE environments SET enabled_in_oss = true WHERE name IN ('default', 'development', 'production');
        UPDATE projects SET enabled_in_oss = true WHERE id = 'default';
    `, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
    ALTER TABLE projects DROP COLUMN enabled_in_oss;
    ALTER TABLE environments DROP COLUMN enabled_in_oss;
  `, cb);
};

