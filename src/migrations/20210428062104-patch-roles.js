'use strict';

exports.up = function (db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text;', cb);
};

exports.down = function (db, cb) {
    // We can't just remove roles for users as we don't know if there has been any manual additions.
    cb();
};
