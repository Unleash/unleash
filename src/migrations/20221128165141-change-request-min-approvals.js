exports.up = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE change_requests ADD COLUMN min_approvals INTEGER DEFAULT 1;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE change_request_approvals DROP COLUMN min_approvals;
`,
        cb,
    );
};
