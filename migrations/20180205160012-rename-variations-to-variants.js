'use strict';

exports.up = function(db, callback) {
    db.runSql(
        `ALTER TABLE features RENAME COLUMN "variations" TO "variants";`,
        callback
    );
};

exports.down = function(db, callback) {
    db.runSql(
        `ALTER TABLE features RENAME COLUMN "variants" TO "variations";`,
        callback
    );
};
