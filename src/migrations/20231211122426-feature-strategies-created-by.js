'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        ALTER TABLE feature_strategies ADD COLUMN IF NOT EXISTS created_by INTEGER;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        ALTER TABLE feature_strategies DROP COLUMN IF EXISTS created_by;
        `,
        callback,
    );
};
