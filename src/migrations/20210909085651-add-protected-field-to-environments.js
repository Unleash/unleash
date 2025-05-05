export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE environments ADD COLUMN protected BOOLEAN DEFAULT false;
    UPDATE environments SET protected = true WHERE name = ':global:';
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
    ALTER TABLE environments DROP COLUMN protected;
  `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
