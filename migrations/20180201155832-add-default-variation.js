'use strict';

exports.up = function(db, callback) {
    db.runSql(
        `ALTER TABLE features ALTER COLUMN "variations" SET DEFAULT '[]';`,
        callback
    );
};

exports.down = function(db, callback) {
    db.runSql(
        `ALTER TABLE features ALTER COLUMN "variations" SET DEFAULT null;`,
        callback
    );
};
