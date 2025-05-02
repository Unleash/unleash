'use strict';

export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE project_settings
            ADD COLUMN IF NOT EXISTS "feature_limit" integer;
        `,
        cb(),
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE project_settings DROP COLUMN IF EXISTS "feature_limit";
        `,
        cb,
    );
};
