'use strict';

export async function up(db, callback) {
    db.runSql(
        `
            ALTER table public_signup_tokens
                ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true
       `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            ALTER table public_signup_tokens
                DROP COLUMN enabled
        `,
        callback,
    );
};
