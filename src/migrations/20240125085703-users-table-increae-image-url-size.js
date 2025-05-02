export async function up(db, cb) {
    db.runSql(
        `
            ALTER TABLE users
                ALTER COLUMN image_url TYPE text;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE users
                ALTER COLUMN image_url TYPE VARCHAR(255);
        `,
        cb,
    );
};
