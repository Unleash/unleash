exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('READ_USER_PAT', 'Read PATs for a specific user', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_USER_PAT', 'Create a PAT for a specific user', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_USER_PAT', 'Delete a PAT for a specific user', 'root');

        INSERT INTO role_permission (role_id, permission_id)
        SELECT
            r.id AS role_id,
            p.id AS permission_id
        FROM roles r
        JOIN permissions p ON p.permission IN ('READ_USER_PAT', 'CREATE_USER_PAT', 'DELETE_USER_PAT')
        WHERE r.name = 'Admin';
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM role_permission WHERE permission_id IN (
            SELECT id FROM permissions WHERE permission IN ('READ_USER_PAT', 'CREATE_USER_PAT', 'DELETE_USER_PAT')
        );

        DELETE FROM permissions WHERE permission = 'READ_USER_PAT';
        DELETE FROM permissions WHERE permission = 'CREATE_USER_PAT';
        DELETE FROM permissions WHERE permission = 'DELETE_USER_PAT';
  `,
        cb,
    );
};
