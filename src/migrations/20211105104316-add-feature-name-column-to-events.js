'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE events
            ADD COLUMN feature_name TEXT;
        CREATE INDEX feature_name_idx ON events(feature_name);
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX feature_name_idx;
        ALTER TABLE events
            DROP COLUMN feature_name;
    `,
        cb,
    );
};
