export async function up(db, cb) {
    db.runSql(`ALTER TABLE client_metrics_env_variants_daily ALTER COLUMN count TYPE BIGINT`, cb);
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE client_metrics_env_variants_daily ALTER COLUMN count TYPE INT`, cb);
};
