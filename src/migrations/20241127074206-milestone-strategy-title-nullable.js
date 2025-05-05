export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_strategies ALTER COLUMN title DROP NOT NULL;
        `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};