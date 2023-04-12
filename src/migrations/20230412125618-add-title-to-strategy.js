'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE strategies ADD COLUMN IF NOT EXISTS title TEXT;
          ALTER TABLE feature_strategies ADD COLUMN IF NOT EXISTS title TEXT;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE strategies DROP COLUMN IF EXISTS title;
          ALTER TABLE feature_strategies DROP COLUMN IF EXISTS title;
        `,
        callback,
    );
};
