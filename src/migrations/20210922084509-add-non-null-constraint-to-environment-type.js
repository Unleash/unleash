'use strict';

export async function up(db, cb) {
    db.runSql(
        `
    UPDATE environments SET type = 'production' WHERE type IS null;
    ALTER TABLE environments ALTER COLUMN type SET NOT NULL`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE environments ALTER COLUMN type DROP NOT NULL`, cb);
};
