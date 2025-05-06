'use strict';

exports.up = function (db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb);
};

exports.down = function (db, cb) {
    cb();
};
