'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE features
        SET potentially_stale = FALSE
        WHERE potentially_stale IS NULL;

        ALTER TABLE features
        ALTER COLUMN potentially_stale SET NOT NULL;
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE features
        ALTER COLUMN potentially_stale DROP NOT NULL;
        `,
        cb
    );
};