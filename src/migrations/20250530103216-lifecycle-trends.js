'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS lifecycle_trends (
                id TEXT NOT NULL,
                stage TEXT NOT NULL CHECK (stage IN ('initial','develop', 'production', 'cleanup', 'archived')),
                flag_type TEXT NOT NULL CHECK (flag_type IN ('experimental', 'release', 'permanent')),
                project VARCHAR(255) NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
                flags_older_than_week INTEGER DEFAULT 0,
                new_flags_this_week INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT now(),
                PRIMARY KEY (id, stage, flag_type, project)
                );
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql('DROP TABLE IF EXISTS lifecycle_trends;', cb);
};
