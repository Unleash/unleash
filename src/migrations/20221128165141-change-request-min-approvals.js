export async function up(db, cb) {
    db.runSql(
        `
      ALTER TABLE change_requests ADD COLUMN min_approvals INTEGER DEFAULT 1;
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
      ALTER TABLE change_requests DROP COLUMN min_approvals;
`,
        cb,
    );
};
