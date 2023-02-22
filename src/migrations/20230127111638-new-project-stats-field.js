exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER table project_stats
                ADD COLUMN IF NOT EXISTS project_members_added_current_window INTEGER DEFAULT 0
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER table project_stats
                DROP COLUMN project_members_added_current_window
  `,
        cb,
    );
};
