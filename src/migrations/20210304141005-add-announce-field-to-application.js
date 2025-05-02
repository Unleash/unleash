'use strict';

export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE client_applications ADD COLUMN announced boolean DEFAULT false;
    UPDATE client_applications SET announced = true;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE client_applications DROP COLUMN announced;
        `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
