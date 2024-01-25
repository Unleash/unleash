'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS user_trends (
            id VARCHAR(255) PRIMARY KEY,
            total_users INTEGER NOT NULL,
            active_users INTEGER NOT NULL,
            created_at TIMESTAMP default now()
        );`,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql('DROP TABLE IF EXISTS user_trends;', cb);
};
