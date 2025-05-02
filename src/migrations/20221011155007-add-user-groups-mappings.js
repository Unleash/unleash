'use strict';

export async function up(db, cb) {
    db.runSql(
        `
            ALTER TABLE groups
                ADD COLUMN IF NOT EXISTS mappings_sso jsonb DEFAULT '[]'::jsonb
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE groups
                DROP COLUMN IF EXISTS mappings_sso;
        `,
        cb,
    );
};
