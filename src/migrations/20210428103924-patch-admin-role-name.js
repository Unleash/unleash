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
    // We can't just remove roles for users as we don't know if there has been any manual additions.
    cb();
};
