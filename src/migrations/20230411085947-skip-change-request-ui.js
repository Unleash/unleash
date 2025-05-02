'use strict';

export async function up(db, callback) {
    db.runSql(
        `
          UPDATE permissions SET display_name = 'Skip change request process' WHERE permission = 'SKIP_CHANGE_REQUEST';
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        UPDATE permissions SET display_name = 'Skip change request process (API-only)' WHERE permission = 'SKIP_CHANGE_REQUEST';
        `,
        callback,
    );
};
