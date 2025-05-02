export async function up(db, cb) {
    db.runSql(
        `
        ALTER table users
                ADD COLUMN IF NOT EXISTS is_service boolean DEFAULT false
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER table users
                DROP COLUMN is_service
  `,
        cb,
    );
};
