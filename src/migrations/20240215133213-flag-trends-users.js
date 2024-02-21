'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE flag_trends ADD COLUMN IF NOT EXISTS users INTEGER DEFAULT 0;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`
        ALTER TABLE flag_trends DROP COLUMN IF EXISTS users;
    `, cb);
};
