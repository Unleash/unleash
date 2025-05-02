export async function up(db, cb) {
    db.runSql(`
        ALTER TABLE client_metrics_env_daily ALTER COLUMN yes TYPE bigint;
        ALTER TABLE client_metrics_env_daily ALTER COLUMN no TYPE bigint;
    `, cb);
};

export async function down(db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
