'use strict';

export async function up(db, callback) {
    db.runSql(
        `
          UPDATE permissions SET display_name = 'Approve/Reject change requests' WHERE permission = 'APPROVE_CHANGE_REQUEST';
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
           UPDATE permissions SET display_name = 'Approve change requests' WHERE permission = 'APPROVE_CHANGE_REQUEST';
        `,
        callback,
    );
};
