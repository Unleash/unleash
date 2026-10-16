exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES
        ('UPDATE_PROJECT_ADDON', 'Create/edit project integrations', 'project');
        SELECT assign_unleash_permission_to_role('UPDATE_PROJECT_ADDON', 'Owner');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `DELETE FROM permissions WHERE permission = 'UPDATE_PROJECT_ADDON';`,
        cb,
    );
};
