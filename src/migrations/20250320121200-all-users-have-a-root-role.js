exports.up = function (db, cb) {
    // add root role Viewer (id 3) to all users who don't have a root role
    db.runSql(
        `INSERT INTO role_user(role_id, user_id, project) SELECT 3, u.id, 'default'
FROM users u
WHERE u.id > 0 AND u.deleted_at IS NULL AND NOT EXISTS (
    SELECT 1
    FROM role_user ru
    JOIN roles r ON ru.role_id = r.id
    WHERE ru.user_id = u.id
      AND r.type IN ('root', 'root-custom')
);`,
        cb,
    );
};

exports.down = function (db, callback) {
    // No rollback
    callback();
};