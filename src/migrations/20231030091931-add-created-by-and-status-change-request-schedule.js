'use strict';

exports.up = function (db, cb) {
  db.runSql(`
        ALTER TABLE change_request_schedule
            ADD COLUMN IF NOT EXISTS created_by integer REFERENCES users(id);

        ALTER TABLE change_request_schedule
            ADD COLUMN IF NOT EXISTS status text default 'pending';

    `, cb);
};

exports.down = function (db, cb) {
  db.runSql(`
      ALTER TABLE change_request_schedule
          DROP COLUMN IF EXISTS created_by;

      ALTER TABLE change_request_schedule
          DROP COLUMN IF EXISTS status;
    `, cb);
};
