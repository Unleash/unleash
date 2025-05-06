exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_FEATURE_DEPENDENCY', 'Update feature dependency', 'project');
        SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_DEPENDENCY', 'Member');
        SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_DEPENDENCY', 'Owner');
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'UPDATE_FEATURE_DEPENDENCY';
  `,
        cb
    );
};
