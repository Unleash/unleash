'use strict';

export async function up(db, cb) {
    db.runSql(
        `
       INSERT INTO context_fields(name, description, sort_order) VALUES('currentTime', 'Allows you to constrain on date values', 3);
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
       DELETE FROM context_fields WHERE name = 'currentTime';
        `,
        cb,
    );
};
