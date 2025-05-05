exports.up = (db, cb) => {
    db.runSql(`
        UPDATE users
        SET
            scim_id = NULL,
            scim_external_id = NULL
        WHERE deleted_at IS NOT NULL AND scim_id IS NOT NULL;
    `, cb);

  };

  exports.down = (db, cb) => {
    cb();
  };
