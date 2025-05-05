
export async function up(db, cb) {
    db.runSql(
        `ALTER TABLE environments
        DROP COLUMN display_name`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `ALTER TABLE environments
        ADD COLUMN display_name TEXT`,
        cb,
    );
};
