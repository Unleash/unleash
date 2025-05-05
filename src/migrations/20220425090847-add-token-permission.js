'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES
            ('READ_API_TOKEN', 'Read API token', 'root');

        INSERT INTO role_permission (role_id, permission_id)
        SELECT
            r.id AS role_id,
            p.id AS permission_id
        FROM roles r
        JOIN permissions p ON p.permission = 'READ_API_TOKEN'
        WHERE r.name IN ('Admin', 'Editor');

        UPDATE roles SET description = 'Users with this role can only read root resources in Unleash. The viewer can be added to specific projects as project member. Viewers may not view API tokens.'
        WHERE name = 'Viewer'
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM role_permission WHERE permission_id = (
            SELECT id FROM permissions WHERE permission = 'READ_API_TOKEN'
        );

        DELETE FROM permissions WHERE permission = 'READ_API_TOKEN';

        UPDATE roles SET description = 'Users with this role can only read root resources in Unleash. The viewer can be added to specific projects as project member.'
        WHERE name = 'Viewer'
        `,
        cb,
    );
};
