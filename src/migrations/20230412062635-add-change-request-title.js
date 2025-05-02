'use strict';

export async function up(db, callback) {
    db.runSql(
        `
          ALTER TABLE change_requests ADD COLUMN title TEXT;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
          ALTER TABLE change_requests DROP COLUMN title;
        `,
        callback,
    );
};
