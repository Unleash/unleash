export async function up(db, cb) {
    db.runSql(
        `
        CREATE TABLE project_environments (
            project_id varchar(255) REFERENCES projects(id) ON DELETE CASCADE,
            environment_name varchar(100) REFERENCES environments(name) ON DELETE CASCADE,
            PRIMARY KEY(project_id, environment_name)
        );
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('DROP TABLE project_environments', cb);
};

export const _meta = {
    version: 1,
};
