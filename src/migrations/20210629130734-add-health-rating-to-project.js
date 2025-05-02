export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE projects ADD COLUMN health integer DEFAULT 100;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
    ALTER TABLE projects DROP COLUMN health;
  `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
