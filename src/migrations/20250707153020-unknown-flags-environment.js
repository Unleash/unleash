exports.up = function(db, cb) {
  db.runSql(`
    ALTER TABLE unknown_flags
      ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'default',
      DROP CONSTRAINT unknown_flags_pkey,
      ADD PRIMARY KEY (name, app_name, environment);
  `, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
    ALTER TABLE unknown_flags
      DROP CONSTRAINT unknown_flags_pkey,
      ADD PRIMARY KEY (name, app_name),
      DROP COLUMN IF EXISTS environment;
  `, cb);
};
