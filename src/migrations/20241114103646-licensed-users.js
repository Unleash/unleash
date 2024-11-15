exports.up = (db, cb) => {
  db.runSql(`
      CREATE TABLE IF NOT EXISTS licensed_users (
        count INT,
        date DATE PRIMARY KEY
      );
  `, cb);

};

exports.down = (db, cb) => {
  db.runSql(`
      DROP TABLE IF EXISTS licensed_users;
  `, cb);
};

