'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE groups
                ADD COLUMN IF NOT EXISTS mappings_sso jsonb DEFAULT '[]'::jsonb
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE groups
                DROP COLUMN IF EXISTS mappings_sso;
        `,
        cb,
    );
};
