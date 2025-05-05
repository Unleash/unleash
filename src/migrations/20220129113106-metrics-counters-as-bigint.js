
export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE client_metrics_env
        ALTER COLUMN yes TYPE BIGINT,
        ALTER COLUMN no TYPE BIGINT;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE client_metrics_env
        ALTER COLUMN yes TYPE INTEGER,
        ALTER COLUMN no TYPE INTEGER;
        `,
        cb,
    );
};
