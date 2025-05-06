'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE features ADD COLUMN IF NOT EXISTS potentially_stale boolean;
        UPDATE features
            SET potentially_stale = TRUE
            FROM feature_types
            WHERE feature_types.id = features.type
            AND CURRENT_TIMESTAMP > (features.created_at + (feature_types.lifetime_days * INTERVAL '1 day'))
            AND features.stale IS NOT TRUE;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER table features DROP COLUMN IF EXISTS potentially_stale;
        `,
        cb,
    );
};
