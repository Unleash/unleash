'use strict';

export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE events ADD COLUMN IF NOT EXISTS tags json DEFAULT '[]'
    `,
        cb,
    );
};
export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE events DROP COLUMN IF EXISTS tags;
    `,
        cb,
    );
};
