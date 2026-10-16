'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE features ADD COLUMN IF NOT EXISTS lifetime_days integer;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE features DROP COLUMN IF EXISTS lifetime_days;`,
        cb,
    );
};
