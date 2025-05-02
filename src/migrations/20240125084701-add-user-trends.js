'use strict';

export async function up(db, cb) {
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

export async function down(db, cb) {
    db.runSql('DROP TABLE IF EXISTS user_trends;', cb);
};
