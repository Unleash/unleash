exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_TAG', 'Add tags to toggles', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_TAG', 'Remove tags from toggles', 'project');

        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Editor' LIMIT 1),
            p.id as permission_id,
            '' as environment
        FROM permissions p
        WHERE p.permission IN
            ('CREATE_TAG',
            'DELETE_TAG');

        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Owner' LIMIT 1),
            p.id as permission_id,
            '' as environment
        FROM permissions p
        WHERE p.permission IN
            ('CREATE_TAG',
            'DELETE_TAG');
`,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
