export async function up(db, cb) {
    db.runSql(
        `
            delete from group_role where project not in (select id from projects);
            ALTER TABLE group_role
            ADD CONSTRAINT fk_group_role_project
                FOREIGN KEY(project)
                    REFERENCES projects(id) ON DELETE CASCADE; `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE group_role DROP CONSTRAINT fk_group_role_project;
`,
        cb,
    );
};
