'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS flag_trends (
            id VARCHAR(255) NOT NULL,
            project VARCHAR(255) NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
            total_flags INTEGER NOT NULL,
            stale_flags INTEGER NOT NULL,
            potentially_stale_flags INTEGER NOT NULL,
            created_at TIMESTAMP default now(),
            PRIMARY KEY (id, project)
        );`,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql('DROP TABLE IF EXISTS flag_trends;', cb);
};
