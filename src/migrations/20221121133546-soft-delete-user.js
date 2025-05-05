
export async function up(db, callback) {
    db.runSql(
        `
            ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
        `,
        callback,
    );
};
