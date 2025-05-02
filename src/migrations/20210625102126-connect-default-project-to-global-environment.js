export async function up(db, cb) {
    db.runSql(
        `
    INSERT INTO project_environments(project_id, environment_name) VALUES ('default', ':global:');
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
    DELETE FROM project_environments WHERE project_id = 'default' AND environment_name = ':global:';
  `,
        cb,
    );
};

export const _meta = {
    version: 1,
};
