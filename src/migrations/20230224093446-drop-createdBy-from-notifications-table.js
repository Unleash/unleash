
export async function up(db, cb) {
    db.runSql(
        `
            ALTER TABLE notifications
                DROP COLUMN IF EXISTS created_by;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE notifications
            ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users (id);
        `,
        cb,
    );
};
