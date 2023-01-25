exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS avg_time_to_prod_current_window FLOAT DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS avg_time_to_prod_past_window FLOAT DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_changes_current_window INTEGER DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_changes_past_window INTEGER DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS features_created_current_window INTEGER DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS features_created_past_window INTEGER DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS features_archived_current_window INTEGER DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS features_archived_past_window INTEGER DEFAULT 0;          
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER table projects DROP COLUMN avg_time_to_prod_current_window;
        ALTER table projects DROP COLUMN avg_time_to_prod_past_window;
        ALTER table projects DROP COLUMN project_changes_current_window;
        ALTER table projects DROP COLUMN project_changes_past_window;
        ALTER table projects DROP COLUMN features_created_current_window;
        ALTER table projects DROP COLUMN features_created_past_window;
        ALTER table projects DROP COLUMN features_archived_current_window;
        ALTER table projects DROP COLUMN features_archived_past_window;
  `,
        cb,
    );
};
