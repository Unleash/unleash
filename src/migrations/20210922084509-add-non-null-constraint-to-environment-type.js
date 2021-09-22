'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE environments SET type = 'production' WHERE type IS null;
    ALTER TABLE environments ALTER COLUMN type SET NOT NULL`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE environments ALTER COLUMN type DROP NOT NULL`, cb);
};
