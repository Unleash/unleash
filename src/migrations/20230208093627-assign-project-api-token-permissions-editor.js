exports.up = function (db, cb) {
    db.runSql(
        `
            INSERT INTO role_permission (role_id, permission_id)
            SELECT (SELECT id as role_id from roles WHERE name = 'Editor' LIMIT 1),
                   p.id   as permission_id
            FROM permissions p
            WHERE p.permission ='READ_PROJECT_API_TOKEN';
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
