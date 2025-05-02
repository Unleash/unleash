export async function up(db, cb) {
    db.runSql(
        `INSERT INTO permissions (permission, display_name, type) VALUES
        ('UPDATE_PROJECT_SEGMENT', 'Create/edit project segment', 'project');`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `DELETE FROM permissions WHERE permission = 'UPDATE_PROJECT_SEGMENT';`,
        cb,
    );
};
