'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE client_applications ADD COLUMN created_by TEXT;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('ALTER TABLE client_applications DROP COLUMN created_by;', cb);
};

exports._meta = {
    version: 1,
};
