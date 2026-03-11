exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE features ADD COLUMN IF NOT EXISTS target_date TIMESTAMPTZ;
         UPDATE features
         SET target_date = features.created_at + (feature_types.lifetime_days * INTERVAL '1 day')
         FROM feature_types
         WHERE features.type = feature_types.id
           AND feature_types.lifetime_days IS NOT NULL
           AND features.created_at > NOW() - INTERVAL '1 year'
           AND features.archived_at IS NULL;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE features DROP COLUMN IF EXISTS target_date;`,
        cb,
    );
};
