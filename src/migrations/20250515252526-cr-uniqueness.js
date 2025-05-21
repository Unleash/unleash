exports.up = (db, callback) => {
    db.runSql(
        `
            WITH ranked AS (
                SELECT id,
                       ROW_NUMBER() OVER (
                       PARTITION BY created_by, project, environment
                       ORDER BY created_at DESC
                   ) AS rn
                FROM change_requests
                WHERE state NOT IN ('Applied', 'Cancelled', 'Rejected', 'Scheduled')
            )
            UPDATE change_requests
            SET state = 'Cancelled'
            WHERE id IN (
                SELECT id FROM ranked WHERE rn > 1
            );

            CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_request_per_user_project_env
                ON change_requests (created_by, project, environment)
                WHERE state NOT IN ('Applied', 'Cancelled', 'Rejected', 'Scheduled');
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        ` DROP INDEX IF EXISTS unique_pending_request_per_user_project_env;`,
        callback,
    );
};
