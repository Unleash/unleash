export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            DROP COLUMN strategies;
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            ADD COLUMN strategies json;
    `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
