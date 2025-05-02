export async function up(db, cb) {
    db.runSql(
        `
        ALTER table project_stats
                DROP COLUMN avg_time_to_prod_past_window
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER table project_stats
                ADD COLUMN IF NOT EXISTS avg_time_to_prod_past_window INTEGER DEFAULT 0
        `,
        cb,
    );
};
