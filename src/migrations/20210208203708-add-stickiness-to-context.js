'use strict';

export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE context_fields ADD COLUMN IF NOT EXISTS stickiness boolean DEFAULT false
    `,
        cb,
    );
};
export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE context_fields DROP COLUMN IF EXISTS stickiness;
    `,
        cb,
    );
};
