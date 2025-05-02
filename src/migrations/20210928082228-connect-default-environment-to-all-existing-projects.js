export async function up(db, cb) {
    db.runSql(
        `
        INSERT INTO project_environments(project_id, environment_name)
        SELECT id, 'default'
        FROM projects
        ON CONFLICT DO NOTHING;
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        DELETE
        FROM project_environments
        WHERE environment_name = 'default';
    `,
        cb,
    );
};
