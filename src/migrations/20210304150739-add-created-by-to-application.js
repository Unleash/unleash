'use strict';

export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE client_applications ADD COLUMN created_by TEXT;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('ALTER TABLE client_applications DROP COLUMN created_by;', cb);
};

export const _meta = {
    version: 1,
};

