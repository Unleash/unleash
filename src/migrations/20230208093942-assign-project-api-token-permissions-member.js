exports.up = function (db, cb) {
    db.runSql(
        `
            INSERT INTO role_permission (role_id, permission_id)
            SELECT (SELECT id as role_id from roles WHERE name = 'Member' LIMIT 1),
                   p.id   as permission_id
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
        DELETE FROM role_permission
       WHERE permission_id IN (SELECT id from permissions WHERE permission IN ('READ_PROJECT_API_TOKEN'))
       AND role_id = (SELECT id as role_id from roles WHERE name = 'Member' LIMIT 1)

  `,
        cb,
    );
};
