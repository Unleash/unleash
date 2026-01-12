exports.up = function (db, cb) {
    db.runSql(
        `INSERT INTO permissions (permission, display_name, type) VALUES
        ('UPDATE_PROJECT_CONTEXT', 'Create/edit project context', 'project');`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `DELETE FROM permissions WHERE permission = 'UPDATE_PROJECT_CONTEXT';`,
        cb,
    );
};
