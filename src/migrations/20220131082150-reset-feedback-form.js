'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
       DELETE FROM user_feedback WHERE nevershow = false;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
