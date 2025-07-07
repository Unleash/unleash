'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `ALTER TABLE feature_link ADD COLUMN domain varchar(255);`,
        callback
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `ALTER TABLE feature_link DROP COLUMN domain;`,
        callback
    );
};
