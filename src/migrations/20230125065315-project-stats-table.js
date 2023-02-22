exports.up = function (db, cb) {
    db.runSql(
        `CREATE TABLE IF NOT EXISTS project_stats (
             project VARCHAR(255) NOT NULL,
             avg_time_to_prod_current_window FLOAT DEFAULT 0,
             avg_time_to_prod_past_window FLOAT DEFAULT 0,
             project_changes_current_window INTEGER DEFAULT 0,
             project_changes_past_window INTEGER DEFAULT 0,
             features_created_current_window INTEGER DEFAULT 0,
             features_created_past_window INTEGER DEFAULT 0,
             features_archived_current_window INTEGER DEFAULT 0,
             features_archived_past_window INTEGER DEFAULT 0,
             FOREIGN KEY (project) references projects(id) ON DELETE CASCADE,
             UNIQUE(project)
         );         
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE project_stats;
  `,
        cb,
    );
};
