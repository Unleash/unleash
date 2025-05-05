export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE environments ADD COLUMN enabled BOOLEAN DEFAULT true;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
    ALTER TABLE environments DROP COLUMN enabled;
  `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
