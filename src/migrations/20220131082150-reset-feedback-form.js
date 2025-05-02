'use strict';

export async function up(db, cb) {
    db.runSql(
        `
       DELETE FROM user_feedback WHERE nevershow = false;
        `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
