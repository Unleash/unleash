export async function up(db, cb) {
    db.runSql(
        `
      ALTER TABLE change_request_approvals ADD CONSTRAINT unique_approvals UNIQUE (change_request_id, created_by);
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
      ALTER TABLE change_request_approvals DROP CONSTRAINT unique_approvals;
`,
        cb,
    );
};
