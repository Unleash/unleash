'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE roles set name='Admin' where name='Super User';
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
