'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        ALTER TABLE features ADD COLUMN IF NOT EXISTS created_by INTEGER;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        ALTER TABLE features DROP COLUMN IF EXISTS created_by;
        `,
        callback,
    );
};
