'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE features ADD COLUMN IF NOT EXISTS created_by INTEGER;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE features DROP COLUMN IF EXISTS created_by;
        `,
        callback,
    );
};
