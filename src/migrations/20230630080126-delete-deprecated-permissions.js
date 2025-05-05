exports.up = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission IN ('CREATE_API_TOKEN', 'UPDATE_API_TOKEN', 'DELETE_API_TOKEN', 'READ_API_TOKEN');
        DELETE FROM permissions WHERE permission = 'UPDATE_ROLE';
        DELETE FROM permissions WHERE permission IN ('CREATE_ADMIN_API_TOKEN', 'UPDATE_ADMIN_API_TOKEN', 'DELETE_ADMIN_API_TOKEN', 'READ_ADMIN_API_TOKEN');

        DELETE FROM role_permission rp where NOT EXISTS (SELECT * FROM permissions WHERE id = rp.permission_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
