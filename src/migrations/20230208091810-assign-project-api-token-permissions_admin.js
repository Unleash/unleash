exports.up = function (db, cb) {
    db.runSql(
        `
            INSERT INTO role_permission (role_id, permission_id)
            SELECT (SELECT id as role_id from roles WHERE name = 'Admin' LIMIT 1),
                   p.id  as permission_id
            FROM permissions p
            WHERE p.permission IN
                  ('READ_PROJECT_API_TOKEN',
                   'CREATE_PROJECT_API_TOKEN',
                   'DELETE_PROJECT_API_TOKEN');
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
