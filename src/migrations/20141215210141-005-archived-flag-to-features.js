'use strict';

exports.up = function (db, callback) {
    db.runSql('ALTER TABLE features ADD archived integer DEFAULT 0;', callback);
};

exports.down = function (db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "archived";', callback);
};
