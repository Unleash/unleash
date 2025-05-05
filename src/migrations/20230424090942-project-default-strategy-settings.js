
export async function up(db, callback) {
    db.runSql(
        `
            ALTER TABLE project_environments
                ADD COLUMN IF NOT EXISTS default_strategy jsonb;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            ALTER TABLE project_environments
                DROP COLUMN IF EXISTS default_strategy;
        `,
        callback,
    );
};
