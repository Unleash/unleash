export async function up(db, cb) {
    db.runSql(`
        ALTER TABLE flag_trends ALTER COLUMN total_yes TYPE bigint;
        ALTER TABLE flag_trends ALTER COLUMN total_no TYPE bigint;
    `, cb);
};

export async function down(db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
