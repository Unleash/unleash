'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
            CREATE INDEX IF NOT EXISTS idx_events_feature_type_id ON events (id)
                WHERE feature_name IS NOT NULL
                    OR type IN ('segment-updated', 'feature_import', 'features-imported');

        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`
        DROP INDEX IF EXISTS idx_events_feature_type_id;
    `, cb);
};
