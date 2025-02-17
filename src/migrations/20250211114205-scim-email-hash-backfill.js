exports.up = (db, cb) => {
    db.runSql(`
        UPDATE users
        SET email_hash = md5(email::text)
        WHERE scim_id IS NOT NULL;
    `, cb);
  
  };
  
  exports.down = (db, cb) => {
    cb();
  };
  
  