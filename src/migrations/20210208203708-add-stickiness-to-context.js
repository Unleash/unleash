'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE context_fields ADD COLUMN IF NOT EXISTS stickiness boolean DEFAULT false
    `,
        cb,
    );
};
exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE context_fields DROP COLUMN IF EXISTS stickiness;
    `,
        cb,
    );
};
