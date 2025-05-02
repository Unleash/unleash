'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        UPDATE events SET created_by_user_id = -1337 WHERE created_by_user_id = -1;
        `,
        callback,
    );
};

export async function down(db, callback) {
    callback();
};
