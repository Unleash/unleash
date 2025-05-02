'use strict';

export async function up(db, callback) {
    db.runSql(
        `
UPDATE events SET type='feature-revived' WHERE type='feature-revive';
UPDATE events SET type='feature-archived' WHERE type='feature-archive';
       `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
UPDATE events SET type='feature-revive' WHERE type='feature-revived';
UPDATE events SET type='feature-archive' WHERE type='feature-archived';
    `,
        callback,
    );
};
