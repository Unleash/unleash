'use strict';

exports.up = function(db, callback) {
    db.runSql(`ALTER TABLE features ADD "variations" json;`, callback);
};

exports.down = function(db, callback) {
    db.runSql(`ALTER TABLE features DROP COLUMN "variations";`, callback);
};
