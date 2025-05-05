
export async function up(db, callback) {
    db.runSql(
        `
            ALTER TABLE environments ADD COLUMN required_approvals INTEGER;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            ALTER TABLE environments DROP COLUMN IF EXISTS required_approvals;
        `,
        callback,
    );
};
