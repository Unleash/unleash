'use strict';

export async function up(db, callback) {
    db.runSql(
        `
       DELETE FROM user_feedback WHERE feedback_id = 'pnps' AND given < NOW() - INTERVAL '3 months';
        `,
        callback(),
    );
};

export async function down(db, callback) {
    callback();
};
