
export async function up(db, callback) {
    db.runSql(
        `
          CREATE INDEX idx_events_project_feature_created
            ON events (project, feature_name, created_at DESC);
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
           DROP INDEX idx_events_project_feature_created;
        `,
        callback,
    );
};
