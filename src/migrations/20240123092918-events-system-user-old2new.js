'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        UPDATE events SET created_by_user_id = -1337 WHERE created_by_user_id = -1;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    callback();
};
