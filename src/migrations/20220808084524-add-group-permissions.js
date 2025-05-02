'use strict';

export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE group_user DROP COLUMN IF EXISTS role;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE group_user ADD COLUMN role text check(role in ('Owner', 'Member')) default 'Member';
    `,
        cb,
    );
};
