'use strict';

export async function up(db, cb) {
    db.runSql(
        `
            UPDATE environments set sort_order = 100 where name = 'development' AND sort_order = 9999;
            UPDATE environments set sort_order = 200 where name = 'production' AND sort_order = 9999;
        `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
