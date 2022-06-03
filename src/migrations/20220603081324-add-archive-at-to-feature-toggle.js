'use strict';

exports.up = function (db, callback) {
    db.runSql('ALTER TABLE features ADD "archived_at" date;', callback);
};

exports.down = function (db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "archived_at";', callback);
};
