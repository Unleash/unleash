'use strict';

exports.up = function (db, cb) {
  db.runSql(`
        CREATE TYPE change_request_schedule_status AS ENUM ('pending', 'failed');

        ALTER TABLE change_request_schedule
            ADD COLUMN IF NOT EXISTS created_by integer REFERENCES users(id);

        ALTER TABLE change_request_schedule
            ADD COLUMN IF NOT EXISTS status change_request_schedule_status default 'pending';

    `, cb);
};

exports.down = function (db, cb) {
  db.runSql(`
      ALTER TABLE change_request_schedule
          DROP COLUMN IF EXISTS created_by;

      ALTER TABLE change_request_schedule
          DROP COLUMN IF EXISTS status;

      DROP TYPE change_request_schedule_status
    `, cb);
};
