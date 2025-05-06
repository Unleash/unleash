'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE features ADD "variants" json;
        ALTER TABLE features ALTER COLUMN "variants" SET DEFAULT '[]';
    `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "variants";', callback);
};
