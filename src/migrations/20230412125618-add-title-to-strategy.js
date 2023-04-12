'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE strategies ADD COLUMN title TEXT;
          ALTER TABLE feature_strategies ADD COLUMN title TEXT;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE strategies DROP COLUMN title;
          ALTER TABLE feature_strategies ADD COLUMN title TEXT;
        `,
        callback,
    );
};
