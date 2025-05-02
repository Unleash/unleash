export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            DROP COLUMN enabled;
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE features
            ADD COLUMN enabled integer DEFAULT 0;
    `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
