'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS lifecycle_trends (
                id TEXT NOT NULL,
                stage TEXT NOT NULL CHECK (stage IN ('develop', 'production', 'cleanup')),
                flag_type TEXT NOT NULL CHECK (category IN ('experimental', 'release', 'permanent')),
                median_time_in_stage_days DECIMAL(10,2) DEFAULT 0,
                flags_older_than_week INTEGER DEFAULT 0,
                new_flags_this_week INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT now(),
                PRIMARY KEY (id, stage, flag_type)
                );`,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql('DROP TABLE IF EXISTS lifecycle_trends;', cb);
};
