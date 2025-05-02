'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        ALTER TABLE feature_tag ADD COLUMN IF NOT EXISTS created_by INTEGER;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        ALTER TABLE feature_tag DROP COLUMN IF EXISTS created_by;
        `,
        callback,
    );
};
