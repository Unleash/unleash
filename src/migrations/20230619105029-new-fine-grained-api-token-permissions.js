exports.up = function (db, cb) {
    db.runSql(
        `
    INSERT INTO permissions(permission, display_name, type) VALUES
        ('CREATE_ADMIN_API_TOKEN', 'Allowed to create new ADMIN tokens', 'root'),
        ('UPDATE_ADMIN_API_TOKEN', 'Allowed to update ADMIN tokens', 'root'),
        ('DELETE_ADMIN_API_TOKEN', 'Allowed to delete ADMIN tokens', 'root'),
        ('READ_ADMIN_API_TOKEN', 'Allowed to read ADMIN tokens', 'root'),
        ('CREATE_CLIENT_API_TOKEN', 'Allowed to create new CLIENT tokens', 'root'),
        ('UPDATE_CLIENT_API_TOKEN', 'Allowed to update CLIENT tokens', 'root'),
        ('DELETE_CLIENT_API_TOKEN', 'Allowed to delete CLIENT tokens', 'root'),
        ('READ_CLIENT_API_TOKEN', 'Allowed to read CLIENT tokens', 'root'),
        ('CREATE_FRONTEND_API_TOKEN', 'Allowed to create new FRONTEND tokens', 'root'),
        ('UPDATE_FRONTEND_API_TOKEN', 'Allowed to update FRONTEND tokens', 'root'),
        ('DELETE_FRONTEND_API_TOKEN', 'Allowed to delete FRONTEND tokens', 'root'),
        ('READ_FRONTEND_API_TOKEN', 'Allowed to read FRONTEND tokens', 'root');
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission IN ('CREATE_ADMIN_API_TOKEN', 'UPDATE_ADMIN_API_TOKEN', 'DELETE_ADMIN_API_TOKEN', 'READ_ADMIN_API_TOKEN');
        DELETE FROM permissions WHERE permission IN ('CREATE_CLIENT_API_TOKEN', 'UPDATE_CLIENT_API_TOKEN', 'DELETE_CLIENT_API_TOKEN', 'READ_CLIENT_API_TOKEN');
        DELETE FROM permissions WHERE permission IN ('CREATE_FRONTEND_API_TOKEN', 'UPDATE_FRONTEND_API_TOKEN', 'DELETE_FRONTEND_API_TOKEN', 'READ_FRONTEND_API_TOKEN');
    `,
        cb,
    );
};
