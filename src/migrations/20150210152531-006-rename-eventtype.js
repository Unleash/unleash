'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
UPDATE events SET type='feature-revived' WHERE type='feature-revive';
UPDATE events SET type='feature-archived' WHERE type='feature-archive';
       `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
UPDATE events SET type='feature-revive' WHERE type='feature-revived';
UPDATE events SET type='feature-archive' WHERE type='feature-archived';
    `,
        callback,
    );
};
