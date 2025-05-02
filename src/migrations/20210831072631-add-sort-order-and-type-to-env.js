export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE environments ADD COLUMN sort_order integer DEFAULT 9999, ADD COLUMN type text;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
    ALTER TABLE environments DROP COLUMN sort_order, DROP COLUMN type;
  `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
