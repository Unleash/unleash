'use strict';

export async function up(db, cb) {
    // mark existing events as announced, set the default to false for future events.
    db.runSql(
        `
        ALTER TABLE events
            ADD COLUMN IF NOT EXISTS "announced" BOOLEAN DEFAULT TRUE,
            ALTER COLUMN "announced" SET DEFAULT FALSE;
        `,
        cb(),
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE events DROP COLUMN IF EXISTS "announced";
        `,
        cb,
    );
};
