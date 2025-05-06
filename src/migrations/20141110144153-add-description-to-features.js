'use strict';

exports.up = function (db, callback) {
    db.runSql('ALTER TABLE features ADD "description" text;', callback);
};

exports.down = function (db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "description";', callback);
};
