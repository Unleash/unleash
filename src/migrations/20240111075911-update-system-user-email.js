'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `UPDATE users SET email = NULL WHERE id = -1337;`,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `UPDATE users SET email = 'system@getunleash.io' WHERE id = -1337;`,
        callback,
    );
};
