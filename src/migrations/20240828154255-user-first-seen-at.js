
export async function up(db, cb) {
    db.runSql(
        `
            ALTER TABLE users ADD COLUMN first_seen_at TIMESTAMP WITHOUT TIME ZONE;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE users DROP COLUMN first_seen_at;
        `,
        cb);
};
