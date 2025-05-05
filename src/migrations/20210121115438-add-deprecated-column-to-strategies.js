
export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE strategies ADD COLUMN deprecated boolean default false
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('ALTER TABLE strategies DROP COLUMN deprecated', cb);
};

export const _meta = {
    version: 1,
};
