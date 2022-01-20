exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('MOVE_FEATURE_TOGGLE', 'Change feature toggle project', 'project');
        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Editor' LIMIT 1),
            p.id as permission_id,
            '*' as environment
        FROM permissions p
        WHERE p.permission IN
            ('MOVE_FEATURE_TOGGLE');


        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Owner' LIMIT 1),
            p.id as permission_id,
            '*' as environment
        FROM permissions p
        WHERE p.permission IN
            ('MOVE_FEATURE_TOGGLE');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'MOVE_FEATURE_TOGGLE';
  `,
        cb,
    );
};
