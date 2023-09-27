'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
       DELETE FROM user_feedback WHERE feedback_id = 'pnps' AND given < NOW() - INTERVAL '3 months';
        `,
        callback(),
    );
};

exports.down = function (db, callback) {
    callback();
};
