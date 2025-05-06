'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE change_requests ADD COLUMN title TEXT;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE change_requests DROP COLUMN title;
        `,
        callback,
    );
};
