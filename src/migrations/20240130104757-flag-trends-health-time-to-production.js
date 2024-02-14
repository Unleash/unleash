'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE flag_trends ADD COLUMN IF NOT EXISTS health INTEGER DEFAULT 100;
        ALTER TABLE flag_trends ADD COLUMN IF NOT EXISTS time_to_production FLOAT DEFAULT 0;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`
        ALTER TABLE flag_trends DROP COLUMN IF EXISTS health;
        ALTER TABLE flag_trends DROP COLUMN IF EXISTS time_to_production;
    `, cb);
};
