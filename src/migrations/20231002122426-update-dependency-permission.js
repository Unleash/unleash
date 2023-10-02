exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_DEPENDENCY', 'Update feature dependency', 'project');
        SELECT assign_unleash_permission_to_role('UPDATE_DEPENDENCY', 'Member');
        SELECT assign_unleash_permission_to_role('UPDATE_DEPENDENCY', 'Owner');
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'UPDATE_DEPENDENCY';
  `,
        cb
    );
};
