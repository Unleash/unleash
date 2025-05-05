
export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE flag_trends ADD COLUMN IF NOT EXISTS users INTEGER DEFAULT 0;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(`
        ALTER TABLE flag_trends DROP COLUMN IF EXISTS users;
    `, cb);
};
